export const truncateEthAddress = (address: string, start = 2, end = 3) => {
  const truncateRegex = new RegExp(
    `^(0x[a-zA-Z0-9]{${start}})[a-zA-Z0-9]+([a-zA-Z0-9]{${end}})$`
  );
  const match = address.match(truncateRegex);
  if (!match) return address;
  return `${match[1]}…${match[2]}`;
};

export const niceNumber = (source: string | number): string => {
  const value = Number(source.toString());
  const formatter = Intl.NumberFormat("en", { notation: "compact" });
  return formatter.format(value);
};
