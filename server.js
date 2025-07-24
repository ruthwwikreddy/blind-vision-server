
import express from "express";
import fileUpload from "express-fileupload";
import OpenAI from "openai";
import bonjour from "bonjour";

const mdns = bonjour();
mdns.publish({ name: "blindvision", type: "http", port: 5000 });


const app = express();
const openai = new OpenAI({ apiKey: "YOUR_OPENAI_KEY" });
app.use(fileUpload());

app.post("/process", async (req, res) => {
  if (!req.files || !req.files.file) return res.status(400).send("No file uploaded");
  const img = req.files.file;
  try {
    const visionResponse = await openai.responses.create({
      model: "gpt-4.1",
      input: [{ role: "user", content: [{ type: "input_image", image_data: img.data.toString("base64") }] }],
    });
    const description = visionResponse.output_text;
    console.log("Scene Description:", description);

    const speechResponse = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "alloy",
      input: description,
    });
    const buffer = Buffer.from(await speechResponse.arrayBuffer());
    res.setHeader("Content-Type", "audio/mpeg");
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
