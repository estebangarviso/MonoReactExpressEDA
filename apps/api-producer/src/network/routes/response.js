const response = ({
  error = true,
  details,
  status = 500,
  res
}) => {
  console.info({ status, error, message: details })
  if (isNextFunction(res)) return res(details);

  if (error === false) return res.status(status).send(details);

  res.status(status).send({ error, message: details })
}

const isNextFunction = res => {
  return (
    typeof res === 'function' &&
    typeof res.name === 'string' &&
    res.name === 'next'
  )
}

export default response
