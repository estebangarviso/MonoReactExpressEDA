import httpErrors from 'http-errors'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'

const ajv = new Ajv({
  removeAdditional: true,
  useDefaults: true,
  coerceTypes: true
})
addFormats(ajv, ['email', 'date']).addKeyword('kind').addKeyword('modifier')

/**
 * @param {Object} schema
 * @param {'body'|'params'} value
 */
const validatorCompiler = (schema, value) => {
  return (req, res, next) => {
    const validate = ajv.compile(schema)

    const ok = validate(req[value])

    if (!ok && validate.errors) {
      const [error] = validate.errors
      const errorMessage = `${error.instancePath} ${error.message}`

      return next(new httpErrors.UnprocessableEntity(errorMessage));
    }

    next()
  };
}

export default validatorCompiler
