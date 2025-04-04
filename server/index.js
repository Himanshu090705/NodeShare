import express from "express";
import { Server } from "socket.io";
import cors from "cors";
import http from "http";
import cookieParser from "cookie-parser";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { NODE_ENV, SECRET } from "../config.js";
import dotenv from "dotenv";
import Stripe from "stripe";
import multer from "multer";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import sharp from "sharp";
import pdfPoppler from "pdf-poppler";
import archiver from "archiver";
import { PDFDocument, StandardFonts } from "pdf-lib";
import potrace from "potrace";
import xml2js from "xml2js";
import pdfParse from "pdf-parse";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { exec } from "child_process";

const stripe = new Stripe(SECRET);

dotenv.config({ path: "../.env" });

const app = express();
const port = 3001;
app.use(
    cors({
        origin: "*", // Change this to your frontend URL
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
    })
);
app.use(express.json());
app.use(cookieParser());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
    maxHttpBufferSize: 500000000, // 500Mb
});

const files = {};
const activeUsers = {};

io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);
    activeUsers[socket.id] = true;

    socket.on("uploadFiles", ({ files: fileDataArray }) => {
        const fileId = uuidv4();
        files[fileId] = { fileDataArray, uploaderId: socket.id };
        socket.emit("filesUploaded", { fileId });
    });

    socket.on("downloadFile", ({ fileId }) => {
        if (files[fileId]) {
            const { uploaderId } = files[fileId];

            if (activeUsers[uploaderId]) {
                socket.emit("receiveFiles", files[fileId]);
            } else {
                socket.emit("fileNotAvailable", "Uploader is not connected.");
            }
        } else {
            socket.emit("fileNotFound", "File not found.");
        }
    });

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
        delete activeUsers[socket.id];

        for (const fileId in files) {
            if (files[fileId].uploaderId === socket.id) {
                io.emit("uploaderDisconnected", { fileId });
            }
        }
    });
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure uploads and converted folders exist
const uploadDir = path.join(__dirname, "uploads");
const convertedDir = path.join(__dirname, "converted");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
if (!fs.existsSync(convertedDir)) fs.mkdirSync(convertedDir);

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({ storage });

// Set ffmpeg path for fluent-ffmpeg
ffmpeg.setFfmpegPath(ffmpegPath);

const __dirname1 = path.resolve();
if (NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname1, "/client/dist")));

    app.get("/api/file/:id", (req, res) => {
        const { id } = req.params;
        if (files[id]) {
            const { uploaderId } = files[id];
            if (activeUsers[uploaderId]) {
                res.json({ files: files[id].fileDataArray });
            } else {
                res.status(403).json({ error: "Uploader is not connected" });
            }
        } else {
            res.status(404).json({ error: "File not found" });
        }
    });

    app.post("/create-checkout-session", async (req, res) => {
        try {
            const { priceId, name } = req.body;
            const session = await stripe.checkout.sessions.create({
                mode: "subscription",
                payment_method_types: ["card"],
                line_items: [{ price: priceId, quantity: 1 }],
                success_url: `http://localhost:3001/success?session_id={CHECKOUT_SESSION_ID}&name=${name}`,
                cancel_url: `http://localhost:3001/cancel`,
            });
            res.status(200).json({ url: session.url });
        } catch (error) {
            console.log(error);
        }
    });

    app.get("/payment-status", async (req, res) => {
        try {
            const { session_id } = req.query;
            if (!session_id) {
                return res.status(400).json({ error: "Missing session_id" });
            }

            const session = await stripe.checkout.sessions.retrieve(session_id);
            res.json({
                id: session.id,
                status: session.payment_status, // "paid" or "unpaid"
                amount_total: session.amount_total,
                currency: session.currency,
                customer_email: session.customer_details?.email || "N/A",
            });
        } catch (error) {
            console.log(error);
        }
    });

    // File conversion handler
    app.post("/api/convert", upload.single("file"), async (req, res) => {
        try {
            const file = req.file;
            const targetFormat = req.body.format;

            if (!file)
                return res.status(400).json({ error: "No file uploaded" });

            const supportedFormats = [
                "mp3",
                "wav",
                "png",
                "jpeg",
                "webp",
                "txt",
                "pdf",
                "docx",
                "jpg",
                "svg",
                "gif",
                "xml",
                "json",
                "heic",
                "image/heic",
                "image/webp",
                "image/svg+xml",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ];
            if (!supportedFormats.includes(targetFormat)) {
                return res
                    .status(400)
                    .json({ error: "Unsupported target format" });
            }

            const inputPath = file.path;

            // Handle PDF to DOCX conversion using Python script
            if (
                targetFormat === "docx" &&
                file.mimetype === "application/pdf"
            ) {
                try {
                    const command = `python pdf2doc.py ${inputPath} ${path.join(
                        convertedDir,
                        "output.docx"
                    )}`;
                    exec(command, (error, stdout, stderr) => {
                        if (error) {
                            console.error(
                                `Error during conversion: ${error.message}`
                            );
                            return res
                                .status(500)
                                .json({ error: "Conversion failed" });
                        }
                        res.download(path.join(convertedDir, "output.docx"));
                    });
                } catch (err) {
                    console.error(
                        "Error during PDF to DOCX conversion:",
                        err.message
                    );
                    res.status(500).json({
                        error: "PDF to DOCX conversion failed",
                    });
                }
            }
            // Handle PDF to JPG conversion
            else if (
                targetFormat === "jpg" &&
                file.mimetype === "application/pdf"
            ) {
                try {
                    const options = {
                        format: "jpeg",
                        out_dir: convertedDir,
                        out_prefix: path.basename(
                            file.originalname,
                            path.extname(file.originalname)
                        ),
                        page: null, // Convert all pages
                    };

                    await pdfPoppler.convert(inputPath, options);

                    const jpgFiles = fs
                        .readdirSync(convertedDir)
                        .filter(
                            (f) =>
                                f.startsWith(
                                    path.basename(
                                        file.originalname,
                                        path.extname(file.originalname)
                                    )
                                ) && f.endsWith(".jpg")
                        );

                    if (jpgFiles.length === 1) {
                        res.download(path.join(convertedDir, jpgFiles[0]));
                    } else {
                        const zipFilename = `${path.basename(
                            file.originalname,
                            path.extname(file.originalname)
                        )}.zip`;
                        const zipFilePath = path.join(
                            convertedDir,
                            zipFilename
                        );
                        const output = fs.createWriteStream(zipFilePath);
                        const archive = archiver("zip", { zlib: { level: 9 } });

                        archive.pipe(output);
                        jpgFiles.forEach((jpgFile) => {
                            archive.file(path.join(convertedDir, jpgFile), {
                                name: jpgFile,
                            });
                        });

                        await archive.finalize();

                        output.on("close", () => res.download(zipFilePath));
                        output.on("error", (err) =>
                            res
                                .status(500)
                                .json({ error: "Failed to create zip file" })
                        );
                    }
                } catch (err) {
                    console.error(
                        "Error during PDF to JPG conversion:",
                        err.message
                    );
                    res.status(500).json({
                        error: "PDF to JPG conversion failed",
                    });
                }
            }
            // Handle WEBP to JPEG, PNG, PDF, SVG, and HEIC conversion
            else if (
                ["jpeg", "png", "pdf", "svg", "heic"].includes(targetFormat) &&
                file.mimetype === "image/webp"
            ) {
                try {
                    const outputPath = path.join(
                        convertedDir,
                        `${path.basename(
                            file.originalname,
                            path.extname(file.originalname)
                        )}.${targetFormat}`
                    );

                    console.log("Input file path:", inputPath);
                    console.log("Output file path:", outputPath);
                    console.log("Target format:", targetFormat);

                    if (["jpeg", "png", "heic"].includes(targetFormat)) {
                        // Convert WEBP to JPEG, PNG, or HEIC using sharp
                        await sharp(inputPath)
                            .toFormat(
                                targetFormat === "heic" ? "heif" : targetFormat,
                                {
                                    quality: 80, // Adjust quality (1-100)
                                    compression:
                                        targetFormat === "heic"
                                            ? "av1"
                                            : undefined, // Use "av1" for HEIC compression
                                }
                            )
                            .toFile(outputPath);

                        // Send the converted file to the client
                        res.download(outputPath, async () => {
                            try {
                                // Delay to ensure the file is no longer in use
                                setTimeout(async () => {
                                    try {
                                        await fs.promises.unlink(outputPath); // Clean up the converted file
                                        await fs.promises.unlink(inputPath); // Clean up the uploaded file
                                    } catch (err) {
                                        if (err.code === "EBUSY") {
                                            console.error(
                                                "File is busy or locked:",
                                                inputPath
                                            );
                                        } else {
                                            console.error(
                                                "Error during file cleanup:",
                                                err.message
                                            );
                                        }
                                    }
                                }, 100); // Delay of 100ms
                            } catch (err) {
                                console.error(
                                    "Error during file cleanup:",
                                    err.message
                                );
                            }
                        });
                    } else if (targetFormat === "pdf") {
                        const tempImagePath = path.join(
                            convertedDir,
                            `${path.basename(
                                file.originalname,
                                path.extname(file.originalname)
                            )}.png`
                        );

                        // Convert WEBP to PNG using sharp
                        await sharp(inputPath)
                            .toFormat("png")
                            .toFile(tempImagePath);

                        // Create a PDF document
                        const pdfDoc = await PDFDocument.create();
                        const imageBytes = fs.readFileSync(tempImagePath);
                        const image = await pdfDoc.embedPng(imageBytes); // Embed the PNG image in the PDF

                        const page = pdfDoc.addPage([
                            image.width,
                            image.height,
                        ]);
                        page.drawImage(image, {
                            x: 0,
                            y: 0,
                            width: image.width,
                            height: image.height,
                        });

                        const outputPath = path.join(
                            convertedDir,
                            `${path.basename(
                                file.originalname,
                                path.extname(file.originalname)
                            )}.pdf`
                        );

                        // Save the PDF to the output path
                        fs.writeFileSync(outputPath, await pdfDoc.save());

                        // Clean up the temporary PNG file
                        await fs.promises.unlink(tempImagePath);

                        // Send the PDF file to the client
                        res.download(outputPath, async () => {
                            try {
                                // Delay to ensure the file is no longer in use
                                setTimeout(async () => {
                                    try {
                                        await fs.promises.unlink(outputPath); // Clean up the converted file
                                        await fs.promises.unlink(inputPath); // Clean up the uploaded file
                                    } catch (err) {
                                        if (err.code === "EBUSY") {
                                            console.error(
                                                "File is busy or locked:",
                                                inputPath
                                            );
                                        } else {
                                            console.error(
                                                "Error during file cleanup:",
                                                err.message
                                            );
                                        }
                                    }
                                }, 100); // Delay of 100ms
                            } catch (err) {
                                console.error(
                                    "Error during file cleanup:",
                                    err.message
                                );
                            }
                        });
                    } else if (targetFormat === "svg") {
                        const tempImagePath = path.join(
                            convertedDir,
                            `${path.basename(
                                file.originalname,
                                path.extname(file.originalname)
                            )}.png`
                        );

                        // Convert WEBP to PNG using sharp
                        await sharp(inputPath)
                            .toFormat("png")
                            .toFile(tempImagePath);

                        // Convert PNG to SVG using potrace
                        potrace.trace(
                            tempImagePath,
                            { color: "black" },
                            async (err, svg) => {
                                if (err) {
                                    console.error(
                                        "Error during WEBP to SVG conversion:",
                                        err.message
                                    );
                                    return res.status(500).json({
                                        error: "WEBP to SVG conversion failed",
                                    });
                                }

                                const outputPath = path.join(
                                    convertedDir,
                                    `${path.basename(
                                        file.originalname,
                                        path.extname(file.originalname)
                                    )}.svg`
                                );

                                // Write the SVG content to a file
                                fs.writeFileSync(outputPath, svg);

                                // Clean up the temporary PNG file
                                await fs.promises.unlink(tempImagePath);

                                // Send the SVG file to the client
                                res.download(outputPath, async () => {
                                    try {
                                        // Delay to ensure the file is no longer in use
                                        setTimeout(async () => {
                                            try {
                                                await fs.promises.unlink(
                                                    outputPath
                                                ); // Clean up the converted file
                                                await fs.promises.unlink(
                                                    inputPath
                                                ); // Clean up the uploaded file
                                            } catch (err) {
                                                if (err.code === "EBUSY") {
                                                    console.error(
                                                        "File is busy or locked:",
                                                        inputPath
                                                    );
                                                } else {
                                                    console.error(
                                                        "Error during file cleanup:",
                                                        err.message
                                                    );
                                                }
                                            }
                                        }, 100); // Delay of 100ms
                                    } catch (err) {
                                        console.error(
                                            "Error during file cleanup:",
                                            err.message
                                        );
                                    }
                                });
                            }
                        );
                    }
                } catch (err) {
                    console.error(
                        `Error during WEBP to ${targetFormat} conversion:`,
                        err.message
                    );
                    res.status(500).json({
                        error: `WEBP to ${targetFormat} conversion failed`,
                    });
                }
            }
            // Handle XML to JSON conversion
            else if (
                targetFormat === "json" &&
                (file.mimetype === "application/xml" ||
                    file.mimetype === "text/xml")
            ) {
                try {
                    const xmlData = fs.readFileSync(inputPath, "utf-8"); // Read the uploaded XML file

                    // Parse XML to JSON
                    const parser = new xml2js.Parser({ explicitArray: false });
                    parser.parseString(xmlData, (err, result) => {
                        if (err) {
                            console.error(
                                "Error during XML to JSON conversion:",
                                err.message
                            );
                            return res.status(500).json({
                                error: "XML to JSON conversion failed",
                            });
                        }

                        const outputPath = path.join(
                            convertedDir,
                            `${path.basename(
                                file.originalname,
                                path.extname(file.originalname)
                            )}.json`
                        );

                        // Write the JSON result to a file
                        fs.writeFileSync(
                            outputPath,
                            JSON.stringify(result, null, 4)
                        );

                        // Send the JSON file to the client
                        res.download(outputPath, async () => {
                            try {
                                // Delay to ensure the file is no longer in use
                                setTimeout(async () => {
                                    try {
                                        await fs.promises.unlink(outputPath); // Clean up the converted file
                                        await fs.promises.unlink(inputPath); // Clean up the uploaded file
                                    } catch (err) {
                                        if (err.code === "EBUSY") {
                                            console.error(
                                                "File is busy or locked:",
                                                inputPath
                                            );
                                        } else {
                                            console.error(
                                                "Error during file cleanup:",
                                                err.message
                                            );
                                        }
                                    }
                                }, 100); // Delay of 100ms
                            } catch (err) {
                                console.error(
                                    "Error during file cleanup:",
                                    err.message
                                );
                            }
                        });
                    });
                } catch (err) {
                    console.error(
                        "Error during XML to JSON conversion:",
                        err.message
                    );
                    res.status(500).json({
                        error: "XML to JSON conversion failed",
                    });
                }
            }
            // Handle JSON to XML conversion
            else if (
                targetFormat === "xml" &&
                file.mimetype === "application/json"
            ) {
                try {
                    const jsonData = fs.readFileSync(inputPath, "utf-8"); // Read the uploaded JSON file
                    const jsonObject = JSON.parse(jsonData); // Parse JSON data

                    // Convert JSON to XML
                    const builder = new xml2js.Builder();
                    const xmlData = builder.buildObject(jsonObject);

                    const outputPath = path.join(
                        convertedDir,
                        `${path.basename(
                            file.originalname,
                            path.extname(file.originalname)
                        )}.xml`
                    );

                    // Write the XML data to a file
                    fs.writeFileSync(outputPath, xmlData);

                    // Send the XML file to the client
                    res.download(outputPath, async () => {
                        try {
                            // Delay to ensure the file is no longer in use
                            setTimeout(async () => {
                                try {
                                    await fs.promises.unlink(outputPath); // Clean up the converted file
                                    await fs.promises.unlink(inputPath); // Clean up the uploaded file
                                } catch (err) {
                                    if (err.code === "EBUSY") {
                                        console.error(
                                            "File is busy or locked:",
                                            inputPath
                                        );
                                    } else {
                                        console.error(
                                            "Error during file cleanup:",
                                            err.message
                                        );
                                    }
                                }
                            }, 100); // Delay of 100ms
                        } catch (err) {
                            console.error(
                                "Error during file cleanup:",
                                err.message
                            );
                        }
                    });
                } catch (err) {
                    console.error(
                        "Error during JSON to XML conversion:",
                        err.message
                    );
                    res.status(500).json({
                        error: "JSON to XML conversion failed",
                    });
                }
            }
            // Handle JPG/PNG to HEIC
            else if (
                ["heic", "jpeg", "png"].includes(targetFormat) &&
                ["image/jpeg", "image/png", "image/heic"].includes(
                    file.mimetype
                )
            ) {
                try {
                    const outputPath = path.join(
                        convertedDir,
                        `${path.basename(
                            file.originalname,
                            path.extname(file.originalname)
                        )}.${targetFormat}`
                    );

                    console.log("Input file path:", inputPath);
                    console.log("Output file path:", outputPath);
                    console.log("Target format:", targetFormat);

                    // Convert using sharp
                    await sharp(inputPath)
                        .toFormat(
                            targetFormat === "heic" ? "heif" : targetFormat,
                            {
                                quality: 80, // Adjust quality (1-100)
                                compression: "av1", // Use "av1" or "hevc" for HEIF compression
                            }
                        )
                        .toFile(outputPath);

                    // Send the converted file to the client
                    res.download(outputPath, async () => {
                        try {
                            // Delay to ensure the file is no longer in use
                            setTimeout(async () => {
                                try {
                                    await fs.promises.unlink(outputPath); // Clean up the converted file
                                    await fs.promises.unlink(inputPath); // Clean up the uploaded file
                                } catch (err) {
                                    if (err.code === "EBUSY") {
                                        console.error(
                                            "File is busy or locked:",
                                            inputPath
                                        );
                                    } else {
                                        console.error(
                                            "Error during file cleanup:",
                                            err.message
                                        );
                                    }
                                }
                            }, 100); // Delay of 100ms
                        } catch (err) {
                            console.error(
                                "Error during file cleanup:",
                                err.message
                            );
                        }
                    });
                } catch (err) {
                    console.error(
                        `Error during ${file.mimetype} to ${targetFormat} conversion:`,
                        err.message
                    );
                    res.status(500).json({
                        error: `${file.mimetype} to ${targetFormat} conversion failed`,
                    });
                }
            }
            // Handle MP3 to WAV and WAV to MP3 conversion
            else if (
                ["mp3", "wav"].includes(targetFormat) &&
                ["audio/mpeg", "audio/wav"].includes(file.mimetype)
            ) {
                try {
                    const outputPath = path.join(
                        convertedDir,
                        `${path.basename(
                            file.originalname,
                            path.extname(file.originalname)
                        )}.${targetFormat}`
                    );

                    ffmpeg(inputPath)
                        .toFormat(targetFormat)
                        .save(outputPath)
                        .on("end", async () => {
                            console.log(
                                `Audio successfully converted to ${targetFormat}:`,
                                outputPath
                            );

                            // Send the converted file to the client
                            res.download(outputPath, async () => {
                                try {
                                    // Delay to ensure the file is no longer in use
                                    setTimeout(async () => {
                                        try {
                                            await fs.promises.unlink(
                                                outputPath
                                            ); // Clean up the converted file
                                            await fs.promises.unlink(inputPath); // Clean up the uploaded file
                                        } catch (err) {
                                            if (err.code === "EBUSY") {
                                                console.error(
                                                    "File is busy or locked:",
                                                    inputPath
                                                );
                                            } else {
                                                console.error(
                                                    "Error during file cleanup:",
                                                    err.message
                                                );
                                            }
                                        }
                                    }, 100); // Delay of 100ms
                                } catch (err) {
                                    console.error(
                                        "Error during file cleanup:",
                                        err.message
                                    );
                                }
                            });
                        })
                        .on("error", (err) => {
                            console.error(
                                `Error during audio conversion to ${targetFormat}:`,
                                err.message
                            );
                            res.status(500).json({
                                error: `Audio conversion to ${targetFormat} failed`,
                            });
                        });
                } catch (err) {
                    console.error(
                        `Error during audio conversion to ${targetFormat}:`,
                        err.message
                    );
                    res.status(500).json({
                        error: `Audio conversion to ${targetFormat} failed`,
                    });
                }
            }
            // Handle video to audio conversion
            else if (
                ["mp3", "wav"].includes(targetFormat) &&
                file.mimetype.includes("video")
            ) {
                try {
                    const outputPath = path.join(
                        convertedDir,
                        `${path.basename(
                            file.originalname,
                            path.extname(file.originalname)
                        )}.${targetFormat}`
                    );

                    ffmpeg(inputPath)
                        .toFormat(targetFormat)
                        .save(outputPath)
                        .on("end", async () => {
                            console.log(
                                `Video successfully converted to ${targetFormat}:`,
                                outputPath
                            );

                            // Send the converted file to the client
                            res.download(outputPath, async () => {
                                try {
                                    // Delay to ensure the file is no longer in use
                                    setTimeout(async () => {
                                        try {
                                            await fs.promises.unlink(
                                                outputPath
                                            ); // Clean up the converted file
                                            await fs.promises.unlink(inputPath); // Clean up the uploaded file
                                        } catch (err) {
                                            if (err.code === "EBUSY") {
                                                console.error(
                                                    "File is busy or locked:",
                                                    inputPath
                                                );
                                            } else {
                                                console.error(
                                                    "Error during file cleanup:",
                                                    err.message
                                                );
                                            }
                                        }
                                    }, 100); // Delay of 100ms
                                } catch (err) {
                                    console.error(
                                        "Error during file cleanup:",
                                        err.message
                                    );
                                }
                            });
                        })
                        .on("error", (err) => {
                            console.error(
                                `Error during video-to-audio conversion:`,
                                err.message
                            );
                            res.status(500).json({
                                error: `Video-to-audio conversion failed`,
                            });
                        });
                } catch (err) {
                    console.error(
                        `Error during video-to-audio conversion:`,
                        err.message
                    );
                    res.status(500).json({
                        error: `Video-to-audio conversion failed`,
                    });
                }
            }
            // Handle image format conversions (e.g., PNG to JPG, JPG to PNG)
            else if (
                ["png", "jpeg", "webp"].includes(targetFormat) &&
                file.mimetype.includes("image")
            ) {
                try {
                    const outputPath = path.join(
                        convertedDir,
                        `${path.basename(
                            file.originalname,
                            path.extname(file.originalname)
                        )}.${targetFormat}`
                    );

                    await sharp(inputPath)
                        .toFormat(targetFormat)
                        .toFile(outputPath);

                    res.download(outputPath, async () => {
                        try {
                            // Delay to ensure the file is no longer in use
                            setTimeout(async () => {
                                try {
                                    await fs.promises.unlink(outputPath); // Clean up the converted file
                                    await fs.promises.unlink(inputPath); // Clean up the uploaded file
                                } catch (err) {
                                    if (err.code === "EBUSY") {
                                        console.error(
                                            "File is busy or locked:",
                                            inputPath
                                        );
                                    } else {
                                        console.error(
                                            "Error during file cleanup:",
                                            err.message
                                        );
                                    }
                                }
                            }, 100); // Delay of 100ms
                        } catch (err) {
                            console.error(
                                "Error during file cleanup:",
                                err.message
                            );
                        }
                    });
                } catch (err) {
                    console.error(
                        "Error during image format conversion:",
                        err.message
                    );
                    res.status(500).json({
                        error: "Image format conversion failed",
                    });
                }
            }
            // Handle PNG or JPEG to PDF conversion
            else if (
                targetFormat === "pdf" &&
                file.mimetype.includes("image")
            ) {
                try {
                    const outputPath = path.join(
                        convertedDir,
                        `${path.basename(
                            file.originalname,
                            path.extname(file.originalname)
                        )}.pdf`
                    );

                    const pdfDoc = await PDFDocument.create();
                    const imageBytes = fs.readFileSync(inputPath);

                    let image;
                    if (file.mimetype === "image/png") {
                        image = await pdfDoc.embedPng(imageBytes);
                    } else if (file.mimetype === "image/jpeg") {
                        image = await pdfDoc.embedJpg(imageBytes);
                    } else {
                        throw new Error(
                            "Unsupported image format for PDF conversion"
                        );
                    }

                    const page = pdfDoc.addPage([image.width, image.height]);
                    page.drawImage(image, {
                        x: 0,
                        y: 0,
                        width: image.width,
                        height: image.height,
                    });

                    fs.writeFileSync(outputPath, await pdfDoc.save());

                    res.download(outputPath, async () => {
                        try {
                            // Delay to ensure the file is no longer in use
                            setTimeout(async () => {
                                try {
                                    await fs.promises.unlink(outputPath); // Clean up the converted file
                                    await fs.promises.unlink(inputPath); // Clean up the uploaded file
                                } catch (err) {
                                    if (err.code === "EBUSY") {
                                        console.error(
                                            "File is busy or locked:",
                                            inputPath
                                        );
                                    } else {
                                        console.error(
                                            "Error during file cleanup:",
                                            err.message
                                        );
                                    }
                                }
                            }, 100); // Delay of 100ms
                        } catch (err) {
                            console.error(
                                "Error during file cleanup:",
                                err.message
                            );
                        }
                    });
                } catch (err) {
                    console.error(
                        "Error during PNG to PDF conversion:",
                        err.message
                    );
                    res.status(500).json({
                        error: "PNG to PDF conversion failed",
                    });
                }
            }
            // Handle PNG or JPG to SVG conversion
            else if (
                targetFormat === "svg" &&
                ["image/png", "image/jpeg"].includes(file.mimetype)
            ) {
                try {
                    const outputPath = path.join(
                        convertedDir,
                        `${path.basename(
                            file.originalname,
                            path.extname(file.originalname)
                        )}.svg`
                    );

                    // Convert PNG or JPG to SVG using potrace
                    potrace.trace(
                        inputPath,
                        { color: "black" },
                        async (err, svg) => {
                            if (err) {
                                console.error(
                                    "Error during PNG/JPG to SVG conversion:",
                                    err.message
                                );
                                return res.status(500).json({
                                    error: "PNG/JPG to SVG conversion failed",
                                });
                            }

                            // Write the SVG content to a file
                            fs.writeFileSync(outputPath, svg);

                            // Send the SVG file to the client
                            res.download(outputPath, async () => {
                                try {
                                    // Delay to ensure the file is no longer in use
                                    setTimeout(async () => {
                                        try {
                                            await fs.promises.unlink(
                                                outputPath
                                            ); // Clean up the converted file
                                            await fs.promises.unlink(inputPath); // Clean up the uploaded file
                                        } catch (err) {
                                            if (err.code === "EBUSY") {
                                                console.error(
                                                    "File is busy or locked:",
                                                    inputPath
                                                );
                                            } else {
                                                console.error(
                                                    "Error during file cleanup:",
                                                    err.message
                                                );
                                            }
                                        }
                                    }, 100); // Delay of 100ms
                                } catch (err) {
                                    console.error(
                                        "Error during file cleanup:",
                                        err.message
                                    );
                                }
                            });
                        }
                    );
                } catch (err) {
                    console.error(
                        "Error during PNG/JPG to SVG conversion:",
                        err.message
                    );
                    res.status(500).json({
                        error: "PNG/JPG to SVG conversion failed",
                    });
                }
            }
            // Handle SVG to WEBP, JPEG, PNG, PDF, and HEIC conversion
            else if (
                ["webp", "jpeg", "png", "pdf", "heic"].includes(targetFormat) &&
                file.mimetype === "image/svg+xml"
            ) {
                try {
                    const outputPath = path.join(
                        convertedDir,
                        `${path.basename(
                            file.originalname,
                            path.extname(file.originalname)
                        )}.${targetFormat}`
                    );

                    console.log("Input file path:", inputPath);
                    console.log("Output file path:", outputPath);
                    console.log("Target format:", targetFormat);

                    if (
                        ["webp", "jpeg", "png", "heic"].includes(targetFormat)
                    ) {
                        // Convert SVG to WEBP, JPEG, PNG, or HEIC using sharp
                        await sharp(inputPath)
                            .toFormat(
                                targetFormat === "heic" ? "heif" : targetFormat,
                                {
                                    quality: 80, // Adjust quality (1-100)
                                    compression:
                                        targetFormat === "heic"
                                            ? "av1"
                                            : undefined, // Use "av1" for HEIC compression
                                }
                            )
                            .toFile(outputPath);

                        // Send the converted file to the client
                        res.download(outputPath, async () => {
                            try {
                                // Delay to ensure the file is no longer in use
                                setTimeout(async () => {
                                    try {
                                        await fs.promises.unlink(outputPath); // Clean up the converted file
                                        await fs.promises.unlink(inputPath); // Clean up the uploaded file
                                    } catch (err) {
                                        if (err.code === "EBUSY") {
                                            console.error(
                                                "File is busy or locked:",
                                                inputPath
                                            );
                                        } else {
                                            console.error(
                                                "Error during file cleanup:",
                                                err.message
                                            );
                                        }
                                    }
                                }, 100); // Delay of 100ms
                            } catch (err) {
                                console.error(
                                    "Error during file cleanup:",
                                    err.message
                                );
                            }
                        });
                    } else if (targetFormat === "pdf") {
                        // Convert SVG to PNG using sharp
                        const tempImagePath = path.join(
                            convertedDir,
                            `${path.basename(
                                file.originalname,
                                path.extname(file.originalname)
                            )}.png`
                        );

                        await sharp(inputPath)
                            .toFormat("png")
                            .toFile(tempImagePath);

                        // Create a PDF document
                        const pdfDoc = await PDFDocument.create();
                        const imageBytes = fs.readFileSync(tempImagePath);
                        const image = await pdfDoc.embedPng(imageBytes); // Embed the PNG image in the PDF

                        const page = pdfDoc.addPage([
                            image.width,
                            image.height,
                        ]);
                        page.drawImage(image, {
                            x: 0,
                            y: 0,
                            width: image.width,
                            height: image.height,
                        });

                        // Save the PDF to the output path
                        fs.writeFileSync(outputPath, await pdfDoc.save());

                        // Clean up the temporary PNG file
                        await fs.promises.unlink(tempImagePath);

                        // Send the PDF file to the client
                        res.download(outputPath, async () => {
                            try {
                                // Delay to ensure the file is no longer in use
                                setTimeout(async () => {
                                    try {
                                        await fs.promises.unlink(outputPath); // Clean up the converted file
                                        await fs.promises.unlink(inputPath); // Clean up the uploaded file
                                    } catch (err) {
                                        if (err.code === "EBUSY") {
                                            console.error(
                                                "File is busy or locked:",
                                                inputPath
                                            );
                                        } else {
                                            console.error(
                                                "Error during file cleanup:",
                                                err.message
                                            );
                                        }
                                    }
                                }, 100); // Delay of 100ms
                            } catch (err) {
                                console.error(
                                    "Error during file cleanup:",
                                    err.message
                                );
                            }
                        });
                    }
                } catch (err) {
                    console.error(
                        `Error during SVG to ${targetFormat} conversion:`,
                        err.message
                    );
                    res.status(500).json({
                        error: `SVG to ${targetFormat} conversion failed`,
                    });
                }
            }
            // Handle HEIC to PNG, JPEG, WEBP, and SVG conversion
            else if (
                ["png", "jpeg", "webp", "svg"].includes(targetFormat) &&
                file.mimetype === "image/heic"
            ) {
                try {
                    const outputPath = path.join(
                        convertedDir,
                        `${path.basename(
                            file.originalname,
                            path.extname(file.originalname)
                        )}.${targetFormat}`
                    );

                    console.log("Input file path:", inputPath);
                    console.log("Output file path:", outputPath);
                    console.log("Target format:", targetFormat);

                    if (["png", "jpeg", "webp"].includes(targetFormat)) {
                        // Convert HEIC to PNG, JPEG, or WEBP using sharp
                        await sharp(inputPath)
                            .toFormat(targetFormat, {
                                quality: 80, // Adjust quality (1-100)
                            })
                            .toFile(outputPath);

                        // Send the converted file to the client
                        res.download(outputPath, async () => {
                            try {
                                // Delay to ensure the file is no longer in use
                                setTimeout(async () => {
                                    try {
                                        await fs.promises.unlink(outputPath); // Clean up the converted file
                                        await fs.promises.unlink(inputPath); // Clean up the uploaded file
                                    } catch (err) {
                                        if (err.code === "EBUSY") {
                                            console.error(
                                                "File is busy or locked:",
                                                inputPath
                                            );
                                        } else {
                                            console.error(
                                                "Error during file cleanup:",
                                                err.message
                                            );
                                        }
                                    }
                                }, 100); // Delay of 100ms
                            } catch (err) {
                                console.error(
                                    "Error during file cleanup:",
                                    err.message
                                );
                            }
                        });
                    } else if (targetFormat === "svg") {
                        const tempImagePath = path.join(
                            convertedDir,
                            `${path.basename(
                                file.originalname,
                                path.extname(file.originalname)
                            )}.png`
                        );

                        // Convert HEIC to PNG using sharp
                        await sharp(inputPath)
                            .toFormat("png")
                            .toFile(tempImagePath);

                        // Convert PNG to SVG using potrace
                        potrace.trace(
                            tempImagePath,
                            { color: "black" },
                            async (err, svg) => {
                                if (err) {
                                    console.error(
                                        "Error during HEIC to SVG conversion:",
                                        err.message
                                    );
                                    return res.status(500).json({
                                        error: "HEIC to SVG conversion failed",
                                    });
                                }

                                // Write the SVG content to a file
                                fs.writeFileSync(outputPath, svg);

                                // Clean up the temporary PNG file
                                await fs.promises.unlink(tempImagePath);

                                // Send the SVG file to the client
                                res.download(outputPath, async () => {
                                    try {
                                        // Delay to ensure the file is no longer in use
                                        setTimeout(async () => {
                                            try {
                                                await fs.promises.unlink(
                                                    outputPath
                                                ); // Clean up the converted file
                                                await fs.promises.unlink(
                                                    inputPath
                                                ); // Clean up the uploaded file
                                            } catch (err) {
                                                if (err.code === "EBUSY") {
                                                    console.error(
                                                        "File is busy or locked:",
                                                        inputPath
                                                    );
                                                } else {
                                                    console.error(
                                                        "Error during file cleanup:",
                                                        err.message
                                                    );
                                                }
                                            }
                                        }, 100); // Delay of 100ms
                                    } catch (err) {
                                        console.error(
                                            "Error during file cleanup:",
                                            err.message
                                        );
                                    }
                                });
                            }
                        );
                    }
                } catch (err) {
                    console.error(
                        `Error during HEIC to ${targetFormat} conversion:`,
                        err.message
                    );
                    res.status(500).json({
                        error: `HEIC to ${targetFormat} conversion failed`,
                    });
                }
            }
            // Handle PDF to TXT conversion
            else if (
                targetFormat === "txt" &&
                file.mimetype === "application/pdf"
            ) {
                try {
                    const pdfData = fs.readFileSync(inputPath); // Read the uploaded PDF file

                    const data = await pdfParse(pdfData); // Extract text from the PDF

                    const outputPath = path.join(
                        convertedDir,
                        `${path.basename(
                            file.originalname,
                            path.extname(file.originalname)
                        )}.txt`
                    );

                    // Write the extracted text to a TXT file
                    fs.writeFileSync(outputPath, data.text);

                    // Send the TXT file to the client
                    res.download(outputPath, async () => {
                        try {
                            // Delay to ensure the file is no longer in use
                            setTimeout(async () => {
                                try {
                                    await fs.promises.unlink(outputPath); // Clean up the converted file
                                    await fs.promises.unlink(inputPath); // Clean up the uploaded file
                                } catch (err) {
                                    if (err.code === "EBUSY") {
                                        console.error(
                                            "File is busy or locked:",
                                            inputPath
                                        );
                                    } else {
                                        console.error(
                                            "Error during file cleanup:",
                                            err.message
                                        );
                                    }
                                }
                            }, 100); // Delay of 100ms
                        } catch (err) {
                            console.error(
                                "Error during file cleanup:",
                                err.message
                            );
                        }
                    });
                } catch (err) {
                    console.error(
                        "Error during PDF to TXT conversion:",
                        err.message
                    );
                    res.status(500).json({
                        error: "PDF to TXT conversion failed",
                    });
                }
            }
            // Handle TXT to PDF conversion
            else if (targetFormat === "pdf" && file.mimetype === "text/plain") {
                try {
                    let textData = fs.readFileSync(inputPath, "utf-8"); // Read the uploaded TXT file

                    // Replace unsupported characters (e.g., replace "●" with "-")
                    textData = textData.replace(/●/g, "-");

                    const pdfDoc = await PDFDocument.create();
                    let page = pdfDoc.addPage();

                    // Use a built-in font (e.g., Helvetica)
                    const font = await pdfDoc.embedFont(
                        StandardFonts.Helvetica
                    );

                    const fontSize = 12;
                    const margin = 50;
                    const textWidth = page.getWidth() - margin * 2;

                    // Custom function to split text into lines based on newline characters and word wrapping
                    const splitTextIntoLines = (
                        text,
                        font,
                        fontSize,
                        maxWidth
                    ) => {
                        const paragraphs = text.split("\n"); // Split text into paragraphs by newline
                        const lines = [];

                        for (const paragraph of paragraphs) {
                            const words = paragraph.split(" ");
                            let currentLine = "";

                            for (const word of words) {
                                const lineWithWord = currentLine
                                    ? `${currentLine} ${word}`
                                    : word;
                                const lineWidth = font.widthOfTextAtSize(
                                    lineWithWord,
                                    fontSize
                                );

                                if (lineWidth <= maxWidth) {
                                    currentLine = lineWithWord;
                                } else {
                                    lines.push(currentLine);
                                    currentLine = word;
                                }
                            }

                            if (currentLine) {
                                lines.push(currentLine);
                            }
                        }

                        return lines;
                    };

                    // Split the text into lines that fit within the page width
                    const lines = splitTextIntoLines(
                        textData,
                        font,
                        fontSize,
                        textWidth
                    );

                    // Calculate the starting Y position
                    let y = page.getHeight() - margin;

                    // Draw each line of text on the page
                    for (const line of lines) {
                        if (y - fontSize < margin) {
                            // Add a new page if the current page is full
                            page = pdfDoc.addPage();
                            y = page.getHeight() - margin;
                        }
                        page.drawText(line, {
                            x: margin,
                            y: y,
                            size: fontSize,
                            font: font,
                        });
                        y -= fontSize + 2; // Adjust line spacing
                    }

                    const outputPath = path.join(
                        convertedDir,
                        `${path.basename(
                            file.originalname,
                            path.extname(file.originalname)
                        )}.pdf`
                    );

                    // Save the PDF to the output path
                    fs.writeFileSync(outputPath, await pdfDoc.save());

                    // Send the PDF file to the client
                    res.download(outputPath, async () => {
                        try {
                            // Delay to ensure the file is no longer in use
                            setTimeout(async () => {
                                try {
                                    await fs.promises.unlink(outputPath); // Clean up the converted file
                                    await fs.promises.unlink(inputPath); // Clean up the uploaded file
                                } catch (err) {
                                    if (err.code === "EBUSY") {
                                        console.error(
                                            "File is busy or locked:",
                                            inputPath
                                        );
                                    } else {
                                        console.error(
                                            "Error during file cleanup:",
                                            err.message
                                        );
                                    }
                                }
                            }, 100); // Delay of 100ms
                        } catch (err) {
                            console.error(
                                "Error during file cleanup:",
                                err.message
                            );
                        }
                    });
                } catch (err) {
                    console.error(
                        "Error during TXT to PDF conversion:",
                        err.message
                    );
                    res.status(500).json({
                        error: "TXT to PDF conversion failed",
                    });
                }
            }
            // Handle PDF to DOCX and DOCX to PDF conversion
            else if (
                (targetFormat === "docx" &&
                    file.mimetype === "application/pdf") ||
                (targetFormat === "pdf" &&
                    file.mimetype ===
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
            ) {
                try {
                    const outputDir = convertedDir; // Directory where LibreOffice saves the converted file
                    const expectedOutputFileName = `${path.basename(
                        inputPath,
                        path.extname(inputPath)
                    )}.${targetFormat}`;
                    const expectedOutputPath = path.join(
                        outputDir,
                        expectedOutputFileName
                    );

                    const command = `soffice --headless --convert-to ${targetFormat} --outdir "${outputDir}" "${inputPath}"`;

                    console.log("Executing command:", command);

                    exec(command, (error, stdout, stderr) => {
                        console.log("Command executed.");
                        console.log("stdout:", stdout);
                        console.log("stderr:", stderr);

                        if (error) {
                            console.error(
                                `Error during conversion: ${error.message}`
                            );
                            return res.status(500).json({
                                error: "Conversion failed",
                                details: stderr,
                            });
                        }

                        // Check if the expected output file exists
                        if (!fs.existsSync(expectedOutputPath)) {
                            console.error(
                                "Converted file not found:",
                                expectedOutputPath
                            );
                            return res
                                .status(500)
                                .json({ error: "Converted file not found" });
                        }

                        // Rename the output file to match the desired output path
                        const outputPath = path.join(
                            outputDir,
                            `${path.basename(file.originalname, path.extname(file.originalname))}.${targetFormat}`
                        );
                        fs.renameSync(expectedOutputPath, outputPath);

                        // Send the converted file to the client
                        res.download(outputPath, async () => {
                            try {
                                // Clean up files after download
                                await fs.promises.unlink(outputPath);
                                await fs.promises.unlink(inputPath);
                            } catch (err) {
                                console.error(
                                    "Error during file cleanup:",
                                    err.message
                                );
                            }
                        });
                    });
                } catch (err) {
                    console.error(
                        `Error during ${file.mimetype} to ${targetFormat} conversion:`,
                        err.message
                    );
                    res.status(500).json({
                        error: `${file.mimetype} to ${targetFormat} conversion failed`,
                    });
                }
            }
            // Handle DOCX to TXT conversion
            else if (
                targetFormat === "txt" &&
                file.mimetype ===
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            ) {
                try {
                    const outputPath = path.join(
                        convertedDir,
                        `${path.basename(file.originalname, path.extname(file.originalname))}.txt`
                    );

                    const command = `python doc2txt.py "${inputPath}" "${outputPath}"`;

                    console.log("Executing command:", command);

                    exec(command, (error, stdout, stderr) => {
                        console.log("Command executed.");
                        console.log("stdout:", stdout);
                        console.log("stderr:", stderr);

                        if (error) {
                            console.error(
                                `Error during conversion: ${error.message}`
                            );
                            return res.status(500).json({
                                error: "Conversion failed",
                                details: stderr,
                            });
                        }

                        // Check if the output file exists
                        if (!fs.existsSync(outputPath)) {
                            console.error(
                                "Converted file not found:",
                                outputPath
                            );
                            return res
                                .status(500)
                                .json({ error: "Converted file not found" });
                        }

                        // Send the converted file to the client
                        res.download(outputPath, async () => {
                            try {
                                // Clean up files after download
                                await fs.promises.unlink(outputPath);
                                await fs.promises.unlink(inputPath);
                            } catch (err) {
                                console.error(
                                    "Error during file cleanup:",
                                    err.message
                                );
                            }
                        });
                    });
                } catch (err) {
                    console.error(
                        "Error during DOCX to TXT conversion:",
                        err.message
                    );
                    res.status(500).json({
                        error: "DOCX to TXT conversion failed",
                    });
                }
            } else {
                res.status(400).json({
                    error: "Unsupported file type or conversion",
                });
            }
        } catch (error) {
            console.error("Error during conversion:", error.message);
            res.status(500).json({ error: error.message });
        }
    });

    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname1, "client", "dist", "index.html"));
    });
}

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
