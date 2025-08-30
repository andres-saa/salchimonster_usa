import { usecartStore } from "@/store/shoping_cart";
import { useSitesStore } from "@/store/site";
import { useUserStore } from "@/store/user";
import axios from "axios";
import { URI } from "../conection";
import { useReportesStore } from "@/store/ventas";
import router from "@/router/index";

// Stores
const report = useReportesStore();
const cart = usecartStore();
const site = useSitesStore();
const user = useUserStore();

/* ----------------------------- Helpers UI/valid ---------------------------- */

function alertMissing(msg: string) {
  alert(msg);
}

/**
 * Normaliza el teléfono:
 * - Si phone_code es objeto con dialCode, usa eso.
 * - Si es string, intenta que empiece con +.
 * - Quita espacios del número.
 */
function buildPhone(): string | null {
  const code = (user.user as any)?.phone_code;
  const number = user.user.phone_number?.toString().replace(/\s+/g, "") || "";

  let dial = "";
  if (!code) return null;

  if (typeof code === "string") {
    dial = code.startsWith("+") ? code : `+${code}`;
  } else if (typeof code === "object" && "dialCode" in code) {
    dial = (code.dialCode as string) || "";
    dial = dial.startsWith("+") ? dial : `+${dial}`;
  }

  if (!dial || !number) return null;
  return `${dial}${number}`;
}

/* --------------------------------- Domain --------------------------------- */

/** Arma la orden base desde los stores. */
function preparar_orden() {
  user.user.was_reserva = false;
  cart.sending_order = true;

  const order_products = cart.cart; // ya traes el objeto del carrito completo (pe_json)
  const site_id = site.location?.site?.site_id;
  const pe_site_id = site.location?.site?.pe_site_id;
  const payment_method_id = user.user.payment_method_option?.id ?? null;
  const order_type_id = user.user.order_type?.id ?? null;
  const placa = user.user.placa?.toString().trim() || "";
  const address_details = cart.address_details

  const delivery_price =
    payment_method_id === 7 ? 0 : site.location?.neigborhood?.delivery_price ?? 0;

  const baseNotes = (cart?.cart as any)?.order_notes ?? "";
  let order_notes = baseNotes || "";

  // Construye user_data (dir cambia si es recoger)
  const phone = buildPhone(); // podría ser null si falta algo
  const user_data = {
    user_name: user.user.name?.toString().trim() || "",
    user_phone: phone || "",
    user_address:
      order_type_id === 2
        ? "recoger / pick up"
        : user.user.site?.description?.toString() || "",
    email: user.user.email?.toString().trim() || "",
  };

  const order = {
    order_products: [], // backend recibe pe_json del carrito completo
    site_id,
    pe_site_id,
    order_type_id,
    placa,
    delivery_person_id: 4,
    payment_method_id,
    delivery_price,
    order_notes: order_notes || "SIN NOTAS",
    user_data,
    order_aditionals: [] as any[],
    pe_json: order_products, // mantengo tu estructura original
    address_details:address_details,
    total: 0,
  };

  return order;
}

/**
 * Valida y alerta por **cada** falta (no junta mensajes).
 * Retorna true si todo OK.
 */
function validateOrder(order: any): boolean {
  // 1) Método de entrega obligatorio
  if (!order.order_type_id) {
    alertMissing("Error: Debe seleccionar un método de entrega.");
  }

  // 2) Placa si es 'Pasar a recoger' (id 2) y la sede es 33
  if (order.order_type_id === 2 && order.site_id === 33) {
    if (!order.placa || order.placa.trim() === "") {
      alertMissing("Error: Debe proporcionar la placa del vehículo para recogida.");
    }
  }

  // 3) Código de país y teléfono
  //    - Si no se pudo construir el teléfono (faltó code o number), alerta.
  if (!order.user_data.user_phone || order.user_data.user_phone.trim() === "") {
    // Afinamos el mensaje para que el cliente sepa exactamente qué mirar:
    const hasPhoneCode = !!(user.user as any)?.phone_code;
    const hasPhoneNumber = !!user.user.phone_number?.toString().trim();
    if (!hasPhoneCode) alertMissing("Error: El código de país del teléfono es obligatorio.");
    if (!hasPhoneNumber) alertMissing("Error: Debe ingresar su número de teléfono.");
  }

  // 4) Nombre
  if (!order.user_data.user_name || order.user_data.user_name.trim() === "") {
    alertMissing("Error: Debe ingresar su nombre.");
  }

  // 5) Dirección
  //    Si es recoger (id 2), ya seteamos "recoger / pick up". Verificamos en otros casos.
  if (order.order_type_id !== 2) {
    if (!order.user_data.user_address || order.user_data.user_address.trim() === "") {
      alertMissing("Error: Debe ingresar su dirección.");
    }
  }

  // 6) Email
  if (!order.user_data.email || order.user_data.email.trim() === "") {
    alertMissing("Error: Debe ingresar su correo electrónico.");
  }

  // 7) Site y delivery_price (site info válida)
  if (!order.site_id) {
    alertMissing("Error: Debe seleccionar una sede válida.");
  }
  if (order.delivery_price == null) {
    alertMissing("Error: El costo de envío no está disponible para su zona.");
  }

  // 8) Método de pago (opcional, pero recomendable)
  if (!order.payment_method_id && order.payment_method_id !== 0) {
    alertMissing("Error: Debe seleccionar un método de pago.");
  }

  // Evaluación final: si falta algo, al menos una alerta se mostró.
  // Para saber si todo está OK, revalidamos de forma estricta:
  const ok =
    !!order.order_type_id &&
    !(order.order_type_id === 2 && order.site_id === 33 && (!order.placa || order.placa.trim() === "")) &&
    !!order.user_data.user_name &&
    order.user_data.user_name.trim() !== "" &&
    !!order.user_data.user_phone &&
    order.user_data.user_phone.trim() !== "" &&
    !!order.user_data.email &&
    order.user_data.email.trim() !== "" &&
    !!order.site_id &&
    order.delivery_price != null &&
    (order.order_type_id === 2 || (order.user_data.user_address && order.user_data.user_address.trim() !== "")) &&
    (order.payment_method_id || order.payment_method_id === 0);

  if (!ok) {
    cart.sending_order = false;
    return false;
  }

  return true;
}

/* --------------------------------- Service -------------------------------- */

export const orderService = {
  async sendOrder() {
    // Prepara y valida
    const order = preparar_orden();

    if (!order) {
      cart.sending_order = false;
      alertMissing("Error: No se pudo preparar el pedido. Recargue e intente de nuevo.");
      return null;
    }

    if (!validateOrder(order)) {
      // validateOrder ya lanzó alerts por cada falta
      return null;
    }

    try {
      report.setLoading(true, `enviando tu pedido ${user.user.name}`);
      const response = await axios.post(`${URI}/order`, order);

      if (response.status === 200) {
        cart.sending_order = false;
        cart.last_order = response.data;
        report.setLoading(false, "enviando tu pedido");

        // Redirección condicional: mantiene tu lógica original
        if (order.payment_method_id !== 9) {
          router.push("/gracias");
        }

        return response.data;
      } else {
        console.error("An error occurred while sending the order:", response.status);
        alertMissing("Ocurrió un error enviando el pedido. Intenta de nuevo.");
        report.setLoading(false, "enviando tu pedido");
        cart.sending_order = false;
        return null;
      }
    } catch (error) {
      console.error("An error occurred while sending the order:", error);
      report.setLoading(false, "enviando tu pedido");
      cart.sending_order = false;
      alertMissing(
        "Ocurrió un error enviando el pedido. Revisa tu conexión a internet e intenta de nuevo."
      );
      return null;
    }
  },

  preparar_orden() {
    return preparar_orden();
  },
};

/* ------------------------------ NOTA IMPORTANTE ----------------------------

- Eliminé/ignoré por completo la parte de "reservas" como pediste.
- Los alerts se disparan por cada campo faltante (uno por ítem), no se agrupan.
- buildPhone() arma el teléfono con +código y número sin espacios cubriendo los dos
  formatos comunes de phone_code (string o {dialCode}).
- Mantengo "recoger / pick up" automáticamente cuando order_type_id === 2.
- Mantengo tu condición de placa para sede 33 y método recoger (id 2).
---------------------------------------------------------------------------- */
