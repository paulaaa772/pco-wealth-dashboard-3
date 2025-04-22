import axios from 'axios';
const POLYGON_KEY = process.env.NEXT_PUBLIC_POLYGON_KEY;

axios.get('https://api.polygon.io/v2/aggs/ticker/AAPL/prev?apiKey=' + POLYGON_KEY)
  .then(response => console.log('SUCCESS:', response.data))
  .catch(error => console.error('ERROR:', error.message));
