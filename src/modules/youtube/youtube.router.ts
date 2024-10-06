import { Router, Request, Response } from 'express';
import axios from 'axios';

const router = Router();

router.post('/download', async (req: Request, res: Response) => {
  const videoUrl: string = req.body.url;

  try {
    const response = await axios.post('http://127.0.0.1:5000/download', { url: videoUrl });
    res.status(response.status).json(response.data);
  } catch (error: any) {  // Use 'any' type here for error
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
});

router.post('/transcribe', async (req: Request, res: Response) => {
  const filePath: string = req.body.filePath;

  try {
    const response = await axios.post('http://127.0.0.1:5000/transcribe', { file_path: filePath });
    res.status(response.status).json(response.data);
  } catch (error: any) {  // Use 'any' type here for error
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
});

export default router;
