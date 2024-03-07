// const express = require('express');
// const app = express();
// const dotenv = require('dotenv');
// const PORT = process.env.PORT || 4040;
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const morgan = require('morgan');

// const messageRoutes = require('./routes/messageRoutes');
// const mongoose = require('mongoose');

// dotenv.config();

// mongoose
//   .connect(
//     'mongodb+srv://jarileminaho:PMc7xtzaX4yXKJM1@cluster0.rf4p1sc.mongodb.net/battleship_test_db?retryWrites=true&w=majority&appName=Cluster0'
//   )
//   .then(() => {
//     console.log('Connected to MongoDB from server');
//   })
//   .catch((error) => {
//     console.error('Error connecting to MongoDB:', error);
//   });

// app.use(cors());
// app.use(morgan('dev'));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));

// app.use('/msg', messageRoutes);

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
