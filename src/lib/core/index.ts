import 'source-map-support/register';
import dotenv from 'dotenv';

/** Init default library */
(function() {
  dotenv.config({ path: `${process.cwd()}/.env` });
})();
