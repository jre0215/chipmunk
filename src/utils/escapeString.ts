function escapeString(input: string): string {
  let output: string = input;
  output = output.replace(/\\/g, "\\\\");
  output = output.replace(/\n/g, "\\n");
  output = output.replace(/"/g, '\\"');
  return `"${output}"`;
}

export default escapeString;
