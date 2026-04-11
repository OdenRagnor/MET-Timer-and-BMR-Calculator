import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/tts", async (req, res) => {
    try {
        const { text } = req.body;

        const response = await axios({
            method: "POST",
            url: "https://api.openai.com/v1/audio/speech",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
            },
            data: {
                model: "gpt-4o-mini-tts",
                voice: "alloy",
                input: text
            },
            responseType: "arraybuffer"
        });

        res.set({
            "Content-Type": "audio/mpeg",
            "Content-Length": response.data.length
        });

        res.send(response.data);

    } catch (err) {
        console.error(err);
        res.status(500).send("TTS failed");
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));