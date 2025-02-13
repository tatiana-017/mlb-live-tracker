import express from "express";
import cors from "cors";
import axios from "axios";
import { GoogleAuth } from "google-auth-library";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Decodificar credenciales Base64 y guardarlas en un archivo temporal
const credentialsPath = "/tmp/gcp-credentials.json"; // Ruta segura en Render
if (process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64) {
  fs.writeFileSync(
    credentialsPath,
    Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64, "base64")
  );
}

app.post("/predict", async (req, res) => {
  const inputData = req.body;
  console.log(inputData);

  try {
    const auth = new GoogleAuth({
      keyFilename: credentialsPath, 
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });

    const client = await auth.getClient();
    const token = await client.getAccessToken();

    const endpoint = `https://us-central1-aiplatform.googleapis.com/v1/projects/${process.env.GCP_PROJECT_ID}/locations/us-central1/endpoints/${process.env.GCP_ENDPOINT_ID}:predict`;

    const response = await axios.post(
      endpoint,
      { instances: [inputData] },
      {
        headers: {
          Authorization: `Bearer ${token.token}`, 
          "Content-Type": "application/json",
        },
      }
    );

    const { lower_bound: lowerBound, upper_bound: upperBound, value } = response.data.predictions[0];

    res.json({
      prediction: {
        lowerBound,
        upperBound,
        value,
      },
    });
  } catch (error) {
    console.error("Error en la predicción:", error);

    if (error.response) {
      console.error("Detalles del error en la respuesta:", error.response.data);
      res.status(error.response.status).json({ error: error.response.data });
    } else if (error.request) {
      console.error("Detalles del error en la solicitud:", error.request);
      res.status(500).json({ error: "No se recibió respuesta del servidor" });
    } else {
      console.error("Error en la configuración de Axios:", error.message);
      res.status(500).json({ error: error.message });
    }
  }
});

app.listen(port, () => {
  console.log(`Servidor backend corriendo en http://localhost:${port}`);
});
