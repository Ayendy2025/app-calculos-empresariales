const mapa = {
  "1": "A",
  "2": "N",
  "3": "T",
  "4": "R",
  "5": "O",
  "6": "P",
  "7": "L",
  "8": "E",
  "9": "X",
  "0": "C"
};

const mapaInv = {};
for (const key in mapa) {
  mapaInv[mapa[key]] = key;
}

const letrasPermitidas = "ANTROPLEXOC";
const caracteresPermitidos = new RegExp(`[^0-9${letrasPermitidas}]`, "gi");
let ultimoResultadoCopiable = "";

function getResultado() {
  return document.getElementById("resultado");
}

function mostrarMensaje(texto, tipo = "warning") {
  const resultado = getResultado();
  if (!resultado) return;

  ultimoResultadoCopiable = "";
  resultado.innerHTML = `<span class="${tipo}">${texto}</span>`;
}

function mostrarResultado(texto, mensaje = "") {
  const resultado = getResultado();
  if (!resultado) return;

  ultimoResultadoCopiable = texto;
  resultado.innerHTML = mensaje
    ? `<span>${texto}</span><span class="success">${mensaje}</span>`
    : `<span>${texto}</span>`;
}

function limpiarCaracteresNoValidos() {
  const input = document.getElementById("input");
  if (!input) return;

  const valorLimpio = input.value.toUpperCase().replace(caracteresPermitidos, "");
  if (input.value !== valorLimpio) {
    input.value = valorLimpio;
    mostrarMensaje("Solo puedes usar numeros y letras del codigo ANTROPLEXOC.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("input");
  if (input) {
    input.addEventListener("input", limpiarCaracteresNoValidos);
  }

  ["precio", "inicial", "adicional", "interes"].forEach((id) => {
    const field = document.getElementById(id);
    if (field) {
      field.addEventListener("input", () => limpiarCampoNumerico(field, true));
    }
  });

  const plazo = document.getElementById("plazo");
  if (plazo) {
    plazo.addEventListener("input", () => limpiarCampoNumerico(plazo, false));
  }
});

function limpiarCampoNumerico(field, permiteDecimal) {
  const original = field.value;
  let valor = original.replace(",", ".").replace(/[^\d.]/g, "");

  if (permiteDecimal) {
    const partes = valor.split(".");
    valor = partes.shift() + (partes.length ? `.${partes.join("")}` : "");
  } else {
    valor = valor.replace(/\./g, "");
  }

  if (original !== valor) {
    field.value = valor;
    mostrarMensaje("En la calculadora solo se permiten numeros.");
  }
}

function codificar() {
  const input = document.getElementById("input");
  if (!input) return;

  const valor = input.value.trim();
  if (!valor) {
    mostrarMensaje("Escribe un numero antes de codificar.");
    return;
  }
  if (!/^[0-9]+$/.test(valor)) {
    mostrarMensaje("Para codificar usa solo numeros del 0 al 9.");
    return;
  }

  let res = "";
  for (const char of valor) {
    res += mapa[char];
  }
  mostrarResultado(res);
}

function decodificar() {
  const input = document.getElementById("input");
  if (!input) return;

  const valor = input.value.toUpperCase().trim();
  if (!valor) {
    mostrarMensaje("Escribe un codigo antes de decodificar.");
    return;
  }
  if (!new RegExp(`^[${letrasPermitidas}]+$`).test(valor)) {
    mostrarMensaje("Para decodificar usa solo letras del codigo ANTROPLEXOC.");
    return;
  }

  let res = "";
  for (const char of valor) {
    res += mapaInv[char];
  }
  mostrarResultado(res);
}

function limpiar() {
  const input = document.getElementById("input");
  const resultado = getResultado();
  if (input) input.value = "";
  ultimoResultadoCopiable = "";
  if (resultado) resultado.innerHTML = "";
}

async function copiar() {
  const texto = ultimoResultadoCopiable;
  if (!texto) {
    mostrarMensaje("No hay resultado para copiar.");
    return;
  }

  try {
    await navigator.clipboard.writeText(texto);
    mostrarResultado(texto, "Resultado copiado.");
  } catch {
    mostrarMensaje("No se pudo copiar el resultado.");
  }
}

function formatMoney(num) {
  return num.toLocaleString("es-DO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function leerNumero(id, fallback = 0) {
  const field = document.getElementById(id);
  const value = field ? parseFloat(field.value.replace(",", ".")) : NaN;
  return Number.isFinite(value) ? value : fallback;
}

function calcular() {
  const resultado = getResultado();
  if (!resultado) return;

  const campos = [
    ["precio", "precio total"],
    ["inicial", "inicial"],
    ["adicional", "adicional"],
    ["plazo", "plazo"],
    ["interes", "interes mensual"]
  ];
  const faltantes = campos
    .filter(([id]) => !document.getElementById(id).value.trim())
    .map(([, nombre]) => nombre);

  if (faltantes.length) {
    mostrarMensaje(`Completa estos campos: ${faltantes.join(", ")}.`);
    return;
  }

  const precio = leerNumero("precio");
  const inicial = leerNumero("inicial");
  const adicional = leerNumero("adicional");
  const plazo = leerNumero("plazo", 1);
  const interes = leerNumero("interes");

  if (precio <= 0 || plazo <= 0) {
    mostrarMensaje("Completa el precio total y el plazo correctamente.");
    return;
  }

  const capital = precio - inicial - adicional;
  if (capital < 0) {
    mostrarMensaje("La inicial y el adicional no pueden superar el precio total.");
    return;
  }

  const interesMensual = capital * (interes / 100);
  const cuotaBase = capital / plazo;
  const cuotaFinal = cuotaBase + interesMensual;
  const totalPagado = cuotaFinal * plazo + inicial + adicional;

  resultado.innerHTML = `
    <span>Capital financiado: <b>RD$ ${formatMoney(capital)}</b></span>
    <span>Interes mensual: <b>RD$ ${formatMoney(interesMensual)}</b></span>
    <span class="highlight">Cuota mensual: RD$ ${formatMoney(cuotaFinal)}</span>
    <span>Total pagado: <b>RD$ ${formatMoney(totalPagado)}</b></span>
  `;
  ultimoResultadoCopiable = resultado.innerText;
}
