/**
 * Wrapper for browser usage
 * Set window global variable
 **/
import { Wampy } from './wampy.js';

declare global {
    // eslint-disable-next-line no-var
    var Wampy: typeof import('./wampy.js').Wampy;
}

globalThis.Wampy = Wampy;
