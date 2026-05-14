
export const urlCleaner = (title: string) => {
    
    return title
    .toLowerCase()
    .replace(/[^\w\s]/g, "")    // remove punctuation
    .trim()
    .split(" ")
    .slice(0, 5)
    .join("-"); //
    // remove spaces at the beginning and end
    // .replace(/\s+/g, "-");
}


export function getTimeDifference(date: string): string {
    const givenDate = new Date(date);
    const currentDate = new Date();
    const timeDifference = Math.abs(currentDate.getTime() - givenDate.getTime());
    const hoursDifference = Math.floor(timeDifference / (1000 * 60 * 60));
    const minutesDifference = Math.floor(timeDifference / (1000 * 60));
    const secondsDifference = Math.floor(timeDifference / 1000);

    if (hoursDifference >= 24) {
        return givenDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
    } else if (hoursDifference > 0) {
        return `${hoursDifference} hours ago`;
    } else if (minutesDifference > 0) {
        return `${minutesDifference} minutes ago`;
    } else {
        return `${secondsDifference} seconds ago`;
    }
}
