//intializing the express & winston environment
const express = require('express');
const winston = require('winston');
const path = require('path');
const fs = require('fs');
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'calculator-microservice' },
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});
// Initializing Express app and giving the port number
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Linking the public folder files (Basically the frontend files to the server)
app.use(express.static('public'));
// Setting Up the environment
app.use((req, res, next) => {
  logger.info({
    message: 'Incoming request',
    method: req.method,
    url: req.url,
    ip: req.ip,
    headers: req.headers
  });
  next();
});
const validateNumbers = (num1, num2) => {
  if (num1 === undefined || num2 === undefined) {
    return { valid: false, error: 'Both num1 and num2 parameters are required' };
  }
  const parsedNum1 = parseFloat(num1);
  const parsedNum2 = parseFloat(num2);
  if (isNaN(parsedNum1) || isNaN(parsedNum2)) {
    return { valid: false, error: 'Both parameters must be valid numbers' };
  }
  return { valid: true, num1: parsedNum1, num2: parsedNum2 };
};
// Giving the routes for the localhost
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
// Addition algorithm
app.get('/add', (req, res) => {
  const { num1, num2 } = req.query;
  const validation = validateNumbers(num1, num2);
  if (!validation.valid) {
    logger.error({
      message: 'Validation error in addition operation',
      error: validation.error,
      params: { num1, num2 }
    });
    return res.status(400).json({ error: validation.error });
  }
  const result = validation.num1 + validation.num2;
  logger.info({
    message: `Addition operation successful: ${validation.num1} + ${validation.num2} = ${result}`,
    operation: 'addition',
    params: { num1: validation.num1, num2: validation.num2 },
    result
  });
  res.json({ result });
});

// Subtraction algorithm 
app.get('/subtract', (req, res) => {
  const { num1, num2 } = req.query;
  const validation = validateNumbers(num1, num2);
  if (!validation.valid) {
    logger.error({
      message: 'Validation error in subtraction operation',
      error: validation.error,
      params: { num1, num2 }
    });
    return res.status(400).json({ error: validation.error });
  }
  const result = validation.num1 - validation.num2;
  logger.info({
    message: `Subtraction operation successful: ${validation.num1} - ${validation.num2} = ${result}`,
    operation: 'subtraction',
    params: { num1: validation.num1, num2: validation.num2 },
    result
  });
  res.json({ result });
});
// Multiplication Algorithm
app.get('/multiply', (req, res) => {
  const { num1, num2 } = req.query;
  const validation = validateNumbers(num1, num2);

  if (!validation.valid) {
    logger.error({
      message: 'Validation error in multiplication operation',
      error: validation.error,
      params: { num1, num2 }
    });
    return res.status(400).json({ error: validation.error });
  }
  const result = validation.num1 * validation.num2;
  logger.info({
    message: `Multiplication operation successful: ${validation.num1} * ${validation.num2} = ${result}`,
    operation: 'multiplication',
    params: { num1: validation.num1, num2: validation.num2 },
    result
  });
  res.json({ result });
});
// Division Algorithm
app.get('/divide', (req, res) => {
  const { num1, num2 } = req.query;
  const validation = validateNumbers(num1, num2);
  if (!validation.valid) {
    logger.error({
      message: 'Validation error in division operation',
      error: validation.error,
      params: { num1, num2 }
    });
    return res.status(400).json({ error: validation.error });
  }
  // Check for division by zero
  if (validation.num2 === 0) {
    logger.error({
      message: 'Division by zero error',
      operation: 'division',
      params: { num1: validation.num1, num2: validation.num2 }
    });
    return res.status(400).json({ error: 'Cannot divide by zero' });
  }
  const result = validation.num1 / validation.num2;
  logger.info({
    message: `Division operation successful: ${validation.num1} / ${validation.num2} = ${result}`,
    operation: 'division',
    params: { num1: validation.num1, num2: validation.num2 },
    result
  });
  res.json({ result });
});
// Handling ther exceptions and error
app.use((err, req, res, next) => {
  logger.error({
    message: 'Server error',
    error: err.message,
    stack: err.stack
  });
  res.status(500).json({ error: 'Internal server error' });
});
// making the server link visible in the console
app.listen(PORT, () => {
  logger.info(`Calculator microservice running on http://localhost:${PORT}`);
  console.log(`Calculator microservice running on http://localhost:${PORT}`);
});
module.exports = app;   