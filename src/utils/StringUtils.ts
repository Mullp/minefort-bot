export class StringUtils {
  public static formatUnixTime(unixTime: number): string {
    const seconds = unixTime / 1000;
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    return new Intl.ListFormat('en-us').format(
      [
        days > 0 ? `${days} day${days !== 1 ? 's' : ''}` : '',
        Math.round(hours % 24) > 0
          ? `${Math.round(hours % 24)} hour${hours % 24 !== 1 ? 's' : ''}`
          : '',
        Math.round(minutes % 60) > 0
          ? `${Math.round(minutes % 60)} minute${minutes % 60 !== 1 ? 's' : ''}`
          : '',
      ].filter(value => value !== '')
    );
  }
}
