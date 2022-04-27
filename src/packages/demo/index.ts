import 'source-map-support/register';
import { getSome } from '~/packages/common/helpers';

(async function main(): Promise<void> {
  getSome();
  console.log('hello demo');
})();
