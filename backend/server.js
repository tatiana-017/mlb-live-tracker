import express from "express";
import cors from "cors";
import axios from "axios";
import { GoogleAuth } from "google-auth-library";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000; // Use environment variable for port if available

app.use(cors());
app.use(express.json());

app.post("/predict", async (req, res) => {
  const inputData = req.body;
  console.log(inputData);

  try {
    const auth = new GoogleAuth(); // No need to specify scopes if using default credentials
    const client = await auth.getClient();
    const token = await client.getAccessToken();

    const endpoint = `https://us-central1-aiplatform.googleapis.com/v1/projects/${process.env.GCP_PROJECT_ID}/locations/us-central1/endpoints/${process.env.GCP_ENDPOINT_ID}:predict`;

    const response = await axios.post(
      endpoint,
      { instances: [inputData] },
      {
        headers: {
          Authorization: `Bearer ${token.token}`, // Access token from token.token
          "Content-Type": "application/json",
        },
      }
    );

    const lowerBound = response.data.predictions[0].lower_bound;
    const upperBound = response.data.predictions[0].upper_bound;
    const value = response.data.predictions[0].value;

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
      console.error("Response Error Details:", error.response.data); // Log full error details
      res.status(error.response.status).json({ error: error.response.data });
    } else if (error.request) {
      console.error("Request Error Details:", error.request); // Log request details
      res.status(500).json({ error: "No response received from the server" });
    } else {
      console.error("Axios Setup Error:", error.message); // Log setup errors
      res.status(500).json({ error: error.message });
    }
  }
});

app.listen(port, () => {
  console.log(`Servidor backend corriendo en http://localhost:${port}`);
});
