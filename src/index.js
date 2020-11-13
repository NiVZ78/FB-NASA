import configure from '@jimp/custom';
import jpeg from '@jimp/jpeg';
import pluginResize from '@jimp/plugin-resize';
import { TXIOutputFormat, encode as encodeTXI } from '@fitbit/image-codec-txi';

export default configure({
  types: [jpeg],
  plugins: [pluginResize],
});

export {encodeTXI}
