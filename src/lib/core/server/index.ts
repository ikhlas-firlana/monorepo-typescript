import 'source-map-support/register';
import dotenv from 'dotenv';

(function() {
  dotenv.config({ path: `${process.cwd()}/.env` });
})();
