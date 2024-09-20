export default (vars: any) => ({
  didNotReturnSentences: {
    errorCode: 'AI001',
    errorMessage: `Anthropic didnt return any sentences for user: ${vars.var1} infostash id ${vars.var2}`,
    statusCode: 400,
  },
});
