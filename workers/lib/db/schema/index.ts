import * as authSchema from "./authSchema"
import * as albumSchema from "./albumSchema"
import * as groupSchema from "./groupSchema"
import * as relationSchema from "./relationSchema"

const schemas = {
  ...authSchema,
  ...albumSchema,
  ...groupSchema,
  ...relationSchema
}

export default schemas