import { eachDayOfInterval, format, isSameDay, subDays } from "date-fns";

export function isEmpty(variable: any): boolean {
    if (variable === null || variable === undefined || variable === '') {
      return true;
    }
    return false;
  }


export const formatDate = (value : string)=>{
    const date = new Date(value);
    const month = date.getMonth() + 1; // Add 1 because month values are zero-based
    const day = date.getDate();
    const year = date.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;

   return(formattedDate);
}


// Function to convert date from DD/MM/YYYY to YYYY-MM-DD format
export const convertDateToDBFormat = (dateString: string): string => {
  const [day, month, year] = dateString.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`; // Format as YYYY-MM-DD
};


// Function to get the date in the format "MMYY"
export const getCurrentMonthYear = (value : string) => {
  const currentDate = new Date(value);
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const year = String(currentDate.getFullYear()).slice(2);
  return `${month}${year}`;
};

export const parseDMY = (s:string) : Date => {
  // let [d, m, y] = s.split(/\D/);
  // return new Date(parseInt(y), parseInt(m)-1, parseInt(d));
  let [d, m, y] = s.split(/\D/).map(Number); // Convertir les valeurs en nombres
  // Créez un objet Date en UTC
  const utcDate = new Date(Date.UTC(y, m - 1, d));
  return utcDate;
};

type Period = {
  to: string | Date | undefined;
  from: string | Date | undefined;
}

export function formatDateRange(period: Period) {
  const DATEFORMAT = "LLL dd";
  const DATEFORMATYEAR = "LLL dd, y";
  const defaultTo = new Date();
  const defaultFrom = subDays(defaultTo, 30);

  if (!period?.from) {
    if (isSameYear(defaultFrom, defaultTo)){
      return `${format(defaultFrom, DATEFORMAT)} - ${format(defaultTo, DATEFORMATYEAR)}`
    }
     
    return `${format(defaultFrom, DATEFORMATYEAR)} - ${format(defaultTo, DATEFORMATYEAR)}`  
  }

  if (period.to) {
    if (isSameYear(new Date(period.from), new Date(period.to))){
      return `${format(period.from, DATEFORMAT)} - ${format(period.to, DATEFORMATYEAR)}`
    }
    return `${format(period.from, DATEFORMATYEAR)} - ${format(period.to, DATEFORMATYEAR)}`
  }

  return format(period.from, DATEFORMATYEAR);

}


export function isSameYear(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear();
}


export const formatReference = (reference: string): string => {
    // S'assure d'avoir une chaîne de 10 caractères avec des zéros au début
    const refPadded = reference.padStart(10, '0');
    
    // Vérifie si la chaîne a la bonne longueur
    if (refPadded.length !== 10) {
        throw new Error('La référence doit avoir 10 caractères maximum');
    }

    // Extrait les parties
    const debut = refPadded.slice(0, 7);  // 7 premiers caractères
    const fin = refPadded.slice(7, 10);   // 3 caractères suivants

    // Retourne le format désiré
    return `${debut}.${fin}0`;
}
