const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('process.env.MONGODB_URI')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Schema
const submissionSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  service: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

// Model
const Submission = mongoose.model('Submission', submissionSchema);

// Routes

// GET all submissions
app.get('/api/submissions', async (req, res) => {
  try {
    const submissions = await Submission.find().sort({ date: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST new submission
app.post('/api/submissions', async (req, res) => {
  const { fullname, email, phone, service, message } = req.body;

  // Validation
  if (!fullname || !email || !phone || !service || !message) {
    return res.status(400).json({ message: 'All fields required' });
  }

  if (!email.includes('@')) {
    return res.status(400).json({ message: 'Invalid email' });
  }

  try {
    const submission = new Submission({
      fullname,
      email,
      phone,
      service,
      message
    });

    const savedSubmission = await submission.save();
    res.status(201).json({
      message: 'Submission saved successfully',
      data: savedSubmission
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET submission by ID
app.get('/api/submissions/:id', async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE submission
app.delete('/api/submissions/:id', async (req, res) => {
  try {
    const submission = await Submission.findByIdAndDelete(req.params.id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    res.json({ message: 'Submission deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});