import { ClientEvent } from "../..";

export default class ErrorEvent extends ClientEvent<"error"> {
  readonly name = "error";
  run(error: Error) {
    console.error(error);
  }
}
