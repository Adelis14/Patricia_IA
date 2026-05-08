const { OpenAI } = require('openai');
const fetch = require('node-fetch');
const Stadistics = require('../models/stadistics');
const ChatLog = require('../models/chatLog');
const fs = require('fs');
const path = require('path');

// Polyfills necesarios para Node.js si hacen falta
if (!globalThis.fetch) {
	globalThis.fetch = fetch;
	globalThis.Headers = fetch.Headers;
	globalThis.Request = fetch.Request;
	globalThis.Response = fetch.Response;
}

const consult_gpt_services = async (prompt_user, currentHistory = []) => {
	try {
		let API_KEY = process.env.DEEPSEEK_API_KEY;

		if (!API_KEY) {
			console.error("Error: DEEPSEEK_API_KEY no está definida en las variables de entorno.");
			throw new Error("API Key not found");
		}

		consult_stadistics_services(prompt_user);

		const openai = new OpenAI({
			apiKey: API_KEY,
			baseURL: 'https://api.deepseek.com', // Endpoint de DeepSeek
		});

		const lowerCaseQuery = prompt_user.toLowerCase();

		// Construir el prompt del sistema leyendo el XML
		const xmlPath = path.join(__dirname, '..', 'assistant-config.xml');
		let IUJO_CONTEXT_AND_RULES = fs.readFileSync(xmlPath, 'utf8');
		
		// Inyectar la fecha y hora actual en la zona de Caracas dinámicamente
		const caracasDate = new Date().toLocaleString('es-VE', { 
			timeZone: 'America/Caracas', 
			dateStyle: 'full', 
			timeStyle: 'long' 
		});
		IUJO_CONTEXT_AND_RULES = IUJO_CONTEXT_AND_RULES.replace('{FECHA_ACTUAL}', caracasDate);

		// Preparar el array de mensajes para DeepSeek
		const messages = [
			{ role: "system", content: IUJO_CONTEXT_AND_RULES }
		];

		// Agregar historial de conversación si existe
		if (currentHistory.length > 0) {
			currentHistory.forEach((msg) => {
				messages.push({
					role: msg.role === "assistant" ? "assistant" : "user",
					content: msg.content
				});
			});
		}

		// Agregar el nuevo mensaje del usuario
		messages.push({ role: "user", content: prompt_user });

		const responseFromApi = await openai.chat.completions.create({
			model: "deepseek-chat",
			messages: messages,
			temperature: 0.8,
			max_tokens: 3000,
			top_p: 0.95
		});

		let jsonResp = responseFromApi.choices[0].message.content;

		const UNKNOWN_INFO_RESPONSE_PHRASE = "Lamento informarte que esa información no se encuentra detallada";
		const OUT_OF_SCOPE_RESPONSE_PHRASE = "Mi función es proporcionar información exclusivamente sobre el Instituto Universitario Jesús Obrero";
		const CONFIRMATION_NOTE_PHRASE = "Te recomiendo siempre confirmar la información más actualizada directamente con el IUJO Catia";

		let finalResponseText = jsonResp;

		if (jsonResp.includes(UNKNOWN_INFO_RESPONSE_PHRASE) || jsonResp.includes(OUT_OF_SCOPE_RESPONSE_PHRASE)) {

		} else if ((lowerCaseQuery.includes('costo') || lowerCaseQuery.includes('arancel') || lowerCaseQuery.includes('fecha')) && !jsonResp.includes(CONFIRMATION_NOTE_PHRASE)) {
			finalResponseText = `${jsonResp}\n\n${CONFIRMATION_NOTE_PHRASE}, ya que los detalles pueden variar y mi información refleja lo disponible hasta la fecha de mi última actualización.`;
		}

		// Actualizar el historial con la nueva respuesta
		let updatedHistory = [...currentHistory];

		// Agregar el mensaje del usuario si no existe en el historial
		if (currentHistory.length === 0 || currentHistory[currentHistory.length - 1].content !== prompt_user) {
			updatedHistory.push({
				role: "user",
				content: prompt_user
			});
		}

		// Agregar la respuesta del asistente
		updatedHistory.push({
			role: "assistant",
			content: finalResponseText
		});

		// Guardar la conversación agrupando por la similitud de la respuesta
		try {
			const logs = await ChatLog.find();
			let matchedLog = null;

			// Función para calcular qué tan parecidas son dos respuestas (solapamiento de palabras)
			const getSimilarity = (str1, str2) => {
				const words1 = str1.toLowerCase().match(/\w+/g) || [];
				const words2 = str2.toLowerCase().match(/\w+/g) || [];
				if(words1.length === 0 || words2.length === 0) return 0;
				const set1 = new Set(words1);
				const set2 = new Set(words2);
				const intersection = [...set1].filter(x => set2.has(x));
				// Si comparten más del 65% de las palabras clave, consideramos que es la misma respuesta
				return intersection.length / Math.min(set1.size, set2.size);
			};

			for (let log of logs) {
				if (log.answer && getSimilarity(log.answer, finalResponseText) > 0.65) {
					matchedLog = log;
					break;
				}
			}

			if (matchedLog) {
				matchedLog.count += 1;
				matchedLog.date = Date.now();
				const normalizedQ = prompt_user.trim().toLowerCase();
				const exists = matchedLog.questions.some(q => q.toLowerCase() === normalizedQ);
				if (!exists) {
					matchedLog.questions.push(prompt_user.trim());
				}
				await matchedLog.save();
			} else {
				await ChatLog.create({ 
					questions: [prompt_user.trim()], 
					answer: finalResponseText,
					count: 1 
				});
			}
			console.log("Historial procesado por similitud de respuesta.");
		} catch (dbError) {
			console.error("No se pudo guardar la conversación en la base de datos:", dbError);
		}

		return {
			response: finalResponseText,
			updatedHistory: updatedHistory
		};

	} catch (error) {
		console.error("Ocurrió un error en consult_gpt_services:", error);
		return {
			response: 'Lo siento, hubo un problema con el servicio de IA. Intenta de nuevo más tarde o verifica tu configuración.',
			updatedHistory: currentHistory
		};
	}
};

const consult_stadistics_services = async (peticion) => {
	try {


		let number = 0;

		if (peticion) {
			number = 1;
		}

		const stadistics = await Stadistics.findOne();

		if (stadistics) {
			stadistics.consultas += number;
			await stadistics.save();
			return;
		}

		console.log("Consulta guardada exitosamente");

	} catch (error) {
		console.error("Ocurrió un error en consult_stadistics_services:", error);
		return {
			response: 'Lo siento, hubo un problema al guardar la traza'
		};
	}
};

module.exports = {
	consult_gpt_services
};