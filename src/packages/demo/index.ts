import '~/lib/core/server';
import { getFoo } from '~/lib/core/server/example';

(async function main(): Promise<void> {
  await getFoo();
  console.log('hello demo');
})();
