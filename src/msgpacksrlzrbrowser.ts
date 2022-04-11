/**
 * Wrapper for browser usage of MsgpackSerializer
 * Set window global variable
 **/
import { MsgpackSerializer } from "./serializers/MsgpackSerializer";
// @ts-ignore
window.MsgpackSerializer = MsgpackSerializer;
