import DerivAPIBasic from "https://cdn.skypack.dev/@deriv/deriv-api/dist/DerivAPIBasic";

const app_id = 62002;
const connection = new WebSocket(`wss://ws.derivws.com/websockets/v3?app_id=${app_id}`);
const api = new DerivAPIBasic({ connection });

let token = "";
let numberOfBuys = 0;
let symbol = "BOOM500";
let entryPrice = 2000;
let currentBuyCount = 0;

const contracts_for_symbol_request = {
    contracts_for: symbol,
    currency: "USD",
    landing_company: "svg",
    product_type: "basic",
};

let price_proposal = {
    amount: 2000,
    basis: "stake",
    contract_type: "MULTUP",
    currency: "USD",
    duration_unit: "s",
    multiplier: 400,
    product_type: "basic",
    proposal: 1,
    req_id: 11,
    symbol: symbol,
};

let buy_contract_request = {
    buy: "",
    price: 2000,
    req_id: 12,
};

const outputDiv = document.getElementById("output");

const resetState = () => {
    currentBuyCount = 0;
};

const clearMessage = () => {
    outputDiv.innerHTML = '';
};

const displayMessage = (message) => {
    clearMessage(); // Limpia la terminal antes de mostrar un nuevo mensaje
    outputDiv.innerHTML += `<p>${message}</p>`;
};

const loginResponse = async (res) => {
    const data = JSON.parse(res.data);

    if (data.error !== undefined) {
        displayMessage(`Authentication unsuccessful: ${data.error.message}`);
        await api.disconnect();
    } else if (data.msg_type === "authorize") {
        displayMessage("Authentication successful.");
        connection.removeEventListener("message", loginResponse);
    }
};

const contractsForSymbolResponse = async (res) => {
    const data = JSON.parse(res.data);

    if (data.error !== undefined) {
        displayMessage(`Error fetching contracts: ${data.error.message}`);
        connection.removeEventListener("message", contractsForSymbolResponse);
        await api.disconnect();
    } else if (data.msg_type === "contracts_for") {
        connection.removeEventListener("message", contractsForSymbolResponse);
        makeMultipleBuys();
    }
};

const priceProposalResponse = async (res) => {
    const data = JSON.parse(res.data);

    if (data.error !== undefined) {
        displayMessage(`Error fetching proposal: ${data.error.message}`);
        connection.removeEventListener("message", priceProposalResponse);
        await api.disconnect();
    } else if (data.msg_type === "proposal") {
        buy_contract_request.buy = data.proposal.id;
        connection.addEventListener("message", buyContractResponse);
        await api.buy(buy_contract_request);
        connection.removeEventListener("message", priceProposalResponse);
    }
};

const buyContractResponse = async (res) => {
    const data = JSON.parse(res.data);

    if (data.error !== undefined) {
        displayMessage(`Buy unsuccessful: ${data.error.message}`);
    } else {
        displayMessage("Buy successful.");
    }
    connection.removeEventListener("message", buyContractResponse);

    currentBuyCount++;
    if (currentBuyCount < numberOfBuys) {
        setTimeout(makeSingleBuy, 1000); // Agrega un retraso antes de hacer la siguiente compra
    } else {
        resetState();
    }
};

const makeSingleBuy = async () => {
    connection.addEventListener("message", priceProposalResponse);
    await api.proposal(price_proposal);
};

const makeMultipleBuys = async () => {
    await makeSingleBuy();
};

const getContractsForSymbol = async () => {
    connection.addEventListener("message", contractsForSymbolResponse);
    await api.contractsFor(contracts_for_symbol_request);
};

const authenticate = async () => {
    token = document.getElementById("token").value;
    connection.addEventListener("message", loginResponse);
    await api.authorize(token);
};

document.getElementById("checkToken").addEventListener("click", authenticate); // Solo autentica el token aquí
document.getElementById("startTrading").addEventListener("click", getContractsForSymbol); // Inicia las compras aquí
