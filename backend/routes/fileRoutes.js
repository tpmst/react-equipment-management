const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authMiddleware");
const {
    downloadFile,
    listFiles,
    uploadFile,
    upload,
    downloadFileSigned
} = require("../controllers/fileController");
const { listFilesAll, deleteFiles, listAllFolders, downloadFiles } = require("../controllers/deleteFilesController");

// Access files
router.get("/download/:filename", authenticateToken, downloadFile);
router.get("/download-signed/:filename", authenticateToken, downloadFileSigned);
router.get("/list-files/:folder", authenticateToken, listFiles);
router.post("/upload", authenticateToken, upload.single("file"), uploadFile);

// Delete files
router.get("/list-folders", authenticateToken, listAllFolders);
router.get("/list-files-all/:foldername", authenticateToken, listFilesAll);
router.delete("/delete-file/:foldername/:filename", authenticateToken, deleteFiles);
router.get("/download-file/:foldername/:filename", authenticateToken, downloadFiles);

module.exports = router;
