import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";

let initialized = false;

export async function initTF() {
  if (initialized) return;

  await tf.setBackend("webgl");
  await tf.ready();

  console.log("✅ TF INITIALIZED ONCE:", tf.getBackend());
  initialized = true;
}
