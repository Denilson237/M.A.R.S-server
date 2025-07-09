import { BankAgency, PrismaClient } from '@prisma/client';

import { AuthService } from '../../../src/modules/auth/auth.service';


// Instantiate the Prisma Client
const prisma = new PrismaClient();

type BankBranch = {
    name: string;
    town: string;
    code: string;
    account_number: string;
    bank: string; // Name of bank 
};

// Function to find the bank name based on the agency name
const findBankName = (agencyName: string): string => {
    // Check for specific bank names in the agency name
    if (agencyName.includes('AFRILAND')) return 'AFRILAND';
    if (agencyName.includes('BICEC')) return 'BICEC';
    if (agencyName.includes('SCB')) return 'SCB';
    if (agencyName.includes('SGC')) return 'SGC';
    if (agencyName.includes('CITIBANK')) return 'CITIBANK';
    if (agencyName.includes('CBC')) return 'CBC';
    if (agencyName.includes('STANDARD')) return 'STANDARD';
    if (agencyName.includes('ECOBANK')) return 'ECOBANK';
    if (agencyName.includes('UBA')) return 'UBA';
    if (agencyName.includes('BANQUE ATLANTIQUE')) return 'BANQUE ATLANTIQUE';
    if (agencyName.includes('BGFI')) return 'BGFI';
    if (agencyName.includes('CCA')) return 'CCA';
    if (agencyName.includes('UBC')) return 'UBC';
    if (agencyName.includes('ORANGE MONEY')) return 'ORANGE MONEY';
    if (agencyName.includes('GBC')) return 'GBC';
    return 'UNKNOWN'; // Default value if no bank is found
};

// List of bank agencies with the `bank` key added
const bankAgencies: BankBranch[] = [
    { name: "AFRILAND (SIEGE)", town: "DOUALA", code: "00002", account_number: "004950 01002", bank: findBankName("AFRILAND (SIEGE)") },
    { name: "AFRILAND/ENCAISSEMENT MAVIANCE", town: "DOUALA", code: "00017", account_number: "004950 01004", bank: findBankName("AFRILAND/ENCAISSEMENT MAVIANCE") },
    { name: "AFRILAND NKONGSAMBA", town: "NKONSAMBA", code: "00012", account_number: "00495001001", bank: findBankName("AFRILAND NKONGSAMBA") },
    { name: "AFRILAND BAMENDA", town: "BAMENDA", code: "00007", account_number: "00495001001", bank: findBankName("AFRILAND BAMENDA") },
    { name: "AFRILAND ENCAISSEMENTS MTN MOBILE MONEY", town: "DOUALA", code: "00017", account_number: "00495001001", bank: findBankName("AFRILAND ENCAISSEMENTS MTN MOBILE MONEY") },
    { name: "AFRILAND/ENEO ENCAISSEMENTS SOKAMTE", town: "DOUALA", code: "00002", account_number: "00495001008", bank: findBankName("AFRILAND/ENEO ENCAISSEMENTS SOKAMTE") },
    { name: "AFRILAND/ENCAISSEMENTS MAVIANCE RURAL", town: "DOUALA", code: "00017", account_number: "00495001002", bank: findBankName("AFRILAND/ENCAISSEMENTS MAVIANCE RURAL") },
    { name: "AFRILAND/ENCAISSEMENTS ENEO-PREPAID MTN", town: "DOUALA", code: "00017", account_number: "00495001003", bank: findBankName("AFRILAND/ENCAISSEMENTS ENEO-PREPAID MTN") },
    { name: "AFRILAND BERTOUA", town: "BERTOUA", code: "00031", account_number: "00495001001", bank: findBankName("AFRILAND BERTOUA") },
    { name: "BANQUE ATLANTIQUE (SIEGE)", town: "DOUALA", code: "11009", account_number: "95764270007", bank: findBankName("BANQUE ATLANTIQUE (SIEGE)") },
    { name: "BANQUE ATLANTIQUE (RECETTES BASSA)", town: "DOUALA", code: "11009", account_number: "95764270022", bank: findBankName("BANQUE ATLANTIQUE (RECETTES BASSA)") },
    { name: "BANQUE ATLANTIQUE (RECETTES BERTOUA)", town: "BERTOUA", code: "11009", account_number: "95764270010", bank: findBankName("BANQUE ATLANTIQUE (RECETTES BERTOUA)") },
    { name: "BANQUE ATLANTIQUE (RECETTE BUEA)", town: "BUEA", code: "11009", account_number: "95764270059", bank: findBankName("BANQUE ATLANTIQUE (RECETTE BUEA)") },
    { name: "BANQUE ATLANTIQUE MESSASSI", town: "YAOUNDE", code: "11009", account_number: "95764270166", bank: findBankName("BANQUE ATLANTIQUE MESSASSI") },
    { name: "BANQUE ATLANTIQUE NKOABANG", town: "YAOUNDE", code: "11009", account_number: "95764270154", bank: findBankName("BANQUE ATLANTIQUE NKOABANG") },
    { name: "BANQUE ATLANTIQUE ODZA", town: "YAOUNDE", code: "11009", account_number: "95764270141", bank: findBankName("BANQUE ATLANTIQUE ODZA") },
    { name: "BANQUE ATLANTIQUE YASSA", town: "DOUALA", code: "11009", account_number: "95764270139", bank: findBankName("BANQUE ATLANTIQUE YASSA") },
    { name: "BANQUE ATLANTIQUE - RECETTE LOGPOM", town: "DOUALA", code: "11009", account_number: "95764270457", bank: findBankName("BANQUE ATLANTIQUE - RECETTE LOGPOM") },
    { name: "BANQUE ATLANTIQUE - ENCAISSEMENT PREPAID ORANGE", town: "DOUALA", code: "11009", account_number: "95764270219", bank: findBankName("BANQUE ATLANTIQUE - ENCAISSEMENT PREPAID ORANGE") },
    { name: "BANQUE ATLANTIQUE ENEO-ENCAISSEMENT POSTPAID ORANGE", town: "DOUALA", code: "11009", account_number: "95764270353", bank: findBankName("BANQUE ATLANTIQUE ENEO-ENCAISSEMENT POSTPAID ORANGE") },
    { name: "BANQUE ATLANTIQUE ENEO-CAMEROON ASSISTANCE TECHNIQUE", town: "DOUALA", code: "11009", account_number: "95764270935", bank: findBankName("BANQUE ATLANTIQUE ENEO-CAMEROON ASSISTANCE TECHNIQUE") },
    { name: "BANQUE ATLANTIQUE ENEO PERACE", town: "DOUALA", code: "11009", account_number: "95764270947", bank: findBankName("BANQUE ATLANTIQUE ENEO PERACE") },
    { name: "BGFI (SIEGE)", town: "DOUALA", code: "01100", account_number: "40003460011", bank: findBankName("BGFI (SIEGE)") },
    { name: "BGFI RECETTES ESSOS", town: "YAOUNDE", code: "01100", account_number: "40003460012", bank: findBankName("BGFI  RECETTES ESSOS") },
    { name: "BGFI ENEO RECETTE BASSA SPECIAL", town: "DOUALA", code: "01100", account_number: "40003460014", bank: findBankName("BGFI ENEO RECETTE BASSA SPECIAL") },
    { name: "BICEC AGENCE SIEGE", town: "DOUALA", code: "06800", account_number: "012111-01000", bank: findBankName("BICEC AGENCE SIEGE") },
    { name: "BICEC AGENCE EDEA", town: "EDEA", code: "06800", account_number: "012111-01001", bank: findBankName("BICEC AGENCE EDEA") },
    { name: "BICEC AGENCE SANGMELIMA", town: "SANGMELIMA", code: "06800", account_number: "012111-01004", bank: findBankName("BICEC AGENCE SANGMELIMA") },
    { name: "BICEC AGENCE MBALMAYO", town: "MBALMAYO", code: "06800", account_number: "012111-01005", bank: findBankName("BICEC AGENCE MBALMAYO") },
    { name: "BICEC AGENCE BERTOUA", town: "BERTOUA", code: "06800", account_number: "012111-01006", bank: findBankName("BICEC AGENCE BERTOUA") },
    { name: "BICEC BAFOUSSAM", town: "BAFOUSSAM", code: "06800", account_number: "012111-01009", bank: findBankName("BICEC BAFOUSSAM") },
    { name: "BICEC AGENCE DSCHANG", town: "DSCHANG", code: "06800", account_number: "012111-01011", bank: findBankName("BICEC AGENCE DSCHANG") },
    { name: "BICEC AGENCE BUEA", town: "BUEA", code: "06800", account_number: "012111-01013", bank: findBankName("BICEC AGENCE BUEA") },
    { name: "BICEC AGENCE TIKO", town: "TIKO", code: "06800", account_number: "012111-01014", bank: findBankName("BICEC AGENCE TIKO") },
    { name: "BICEC AGENCE KUMBA", town: "KUMBA", code: "06800", account_number: "012111-01015", bank: findBankName("BICEC AGENCE KUMBA") },
    { name: "BICEC AGENCE MAMFE", town: "MAMFE", code: "06800", account_number: "012111-01016", bank: findBankName("BICEC AGENCE MAMFE") },
    { name: "BICEC AGENCE LIMBE", town: "LIMBE", code: "06800", account_number: "012111-01017", bank: findBankName("BICEC AGENCE LIMBE") },
    { name: "BICEC AGENCE BAFANG", town: "BAFANG", code: "06800", account_number: "012111-01018", bank: findBankName("BICEC AGENCE BAFANG") },
    { name: "BICEC AGENCE EBOLOWA", town: "EBOLOWA", code: "06800", account_number: "012111-01539", bank: findBankName("BICEC AGENCE EBOLOWA") },
    { name: "BICEC KRIBI RURAL", town: "KRIBI", code: "06821", account_number: "012111-21001", bank: findBankName("BICEC KRIBI RURAL") },
    { name: "BICEC AGENCE KOUSSERI", town: "KOUSSERI", code: "06871", account_number: "012111-71003", bank: findBankName("BICEC AGENCE KOUSSERI") },
    { name: "BICEC AGENCE NKONGSAMBA", town: "NKONGSAMBA", code: "06871", account_number: "012111-25005", bank: findBankName("BICEC AGENCE NKONGSAMBA") },
    { name: "BICEC AGENCEBAMENDA", town: "BAMENDA", code: "06845", account_number: "012111-45003", bank: findBankName("BICEC AGENCEBAMENDA") },
    { name: "CA SCB SIEGE", town: "DOUALA", code: "00030", account_number: "01833523152", bank: findBankName("CA SCB SIEGE") },
    { name: "CA SCB DES PALMIERS", town: "DOUALA", code: "00030", account_number: "90001149897", bank: findBankName("CA SCB DES PALMIERS") },
    { name: "ENECBC SIEGE", town: "DOUALA", code: "00020", account_number: "37 120 106 301", bank: findBankName("ENECBC SIEGE") },
    { name: "CBC BONABERI SUD", town: "DOUALA", code: "00020", account_number: "37 120 106 310", bank: findBankName("CBC BONABERI SUD") },
    { name: "CBC BONABERI NORD", town: "DOUALA", code: "00020", account_number: "37 120 106 325", bank: findBankName("CBC BONABERI NORD") },
    { name: "CBC BILLES", town: "DOUALA", code: "00020", account_number: "37 120 106 338", bank: findBankName("CBC BILLES") },
    { name: "CBC BAFOUSSAM", town: "BAFOUSSAM", code: "00040", account_number: "37 120 106 334", bank: findBankName("CBC BAFOUSSAM") },
    { name: "CBC DEIDO", town: "DOUALA", code: "00020", account_number: "37 120 106 333", bank: findBankName("CBC DEIDO") },
    { name: "CBC DAKAR", town: "DOUALA", code: "00020", account_number: "37 120 106 332", bank: findBankName("CBC DAKAR") },
    { name: "CBC LIMBE", town: "LIMBE", code: "00020", account_number: "37 120 106 339", bank: findBankName("CBC LIMBE") },
    { name: "CCA SIEGE", town: "DOUALA", code: "10035", account_number: "00261886401", bank: findBankName("CCA SIEGE") },
    { name: "CCA KOUSSERI", town: "KOUSSERI", code: "10035", account_number: "00261886402", bank: findBankName("CCA KOUSSERI") },
    { name: "CCA DSCHANG", town: "DSCHANG", code: "10035", account_number: "00261886403", bank: findBankName("CCA DSCHANG") },
    { name: "CCA NKONGSAMBA", town: "NKONGSAMBA", code: "10035", account_number: "00261886404", bank: findBankName("CCA NKONGSAMBA") },
    { name: "CCA EBOLOWA", town: "EBOLOWA", code: "10035", account_number: "00261886405", bank: findBankName("CCA EBOLOWA") },
    { name: "CCA SANGMELIMA", town: "SANGMELIMA", code: "10035", account_number: "00261886406", bank: findBankName("CCA SANGMELIMA") },
    { name: "CCA NDOGPASSI", town: "DOUALA", code: "10035", account_number: "02261886401", bank: findBankName("CCA NDOGPASSI") },
    { name: "CCA FOUMBOT", town: "FOUMBOT", code: "10035", account_number: "02261886408", bank: findBankName("CCA FOUMBOT") },
    { name: "CCA FOUMBAN", town: "FOUMBAN", code: "10035", account_number: "02261886409", bank: findBankName("CCA FOUMBAN") },
    { name: "CCA BUEA", town: "BUEA", code: "10035", account_number: "02261886404", bank: findBankName("CCA BUEA") },
    { name: "CCA LIMBE", town: "LIMBE", code: "10035", account_number: "02261886405", bank: findBankName("CCA LIMBE") },
    { name: "CCA TIKO", town: "TIKO", code: "10035", account_number: "02261886406", bank: findBankName("CCA TIKO") },
    { name: "CCA-MBOUDA", town: "MBOUDA", code: "10035", account_number: "02261886407", bank: findBankName("CCA-MBOUDA") },
    { name: "CCA BAFIA", town: "BAFIA", code: "10035", account_number: "02261886403", bank: findBankName("CCA BAFIA") },
    { name: "CITIBANK (SIEGE)", town: "DOUALA", code: "00001", account_number: "000 15155 019", bank: findBankName("CITIBANK (SIEGE)") },
    { name: "CITIBANK RECETTE BASSA SPECIAL", town: "DOUALA", code: "00001", account_number: "000 15155 027", bank: findBankName("CITIBANK RECETTE BASSA SPECIAL") },
    { name: "CITIBANK CENTRE (YDE CENTRE)", town: "YAOUNDE", code: "00002", account_number: "000 15155 108", bank: findBankName("CITIBANK CENTRE (YDE CENTRE)") },
    { name: "CITIBANK RECETTE MVAN", town: "YAOUNDE", code: "00002", account_number: "000 15155 434", bank: findBankName("CITIBANK RECETTE MVAN") },
    { name: "CITIBANK KOUMASSI", town: "DOUALA", code: "00001", account_number: "000 15155 444", bank: findBankName("CITIBANK KOUMASSI") },
    { name: "CITIBANK COMPTES SALAIRES", town: "DOUALA", code: "00001", account_number: "000 15155 505", bank: findBankName("CITIBANK COMPTES SALAIRES") },
    { name: "CITIBANK CLIENTS SPECIAUX", town: "DOUALA", code: "00001", account_number: "000 15155 511", bank: findBankName("CITIBANK CLIENTS SPECIAUX") },
    { name: "ORANGE MONEY", town: "DOUALA", code: "00001", account_number: "000 15155 018", bank: findBankName("ORANGE MONEY") },
    { name: "CITIBANK BILLES", town: "DOUALA", code: "00001", account_number: "000 15155 001", bank: findBankName("CITIBANK BILLES") },
    { name: "CITIBANK DEIDO", town: "DOUALA", code: "00001", account_number: "000 15155 001", bank: findBankName("CITIBANK DEIDO") },
    { name: "CITIBANK AKWA", town: "DOUALA", code: "00001", account_number: "00015155056", bank: findBankName("CITIBANK AKWA") },
    { name: "CITIBANK BEPANDA", town: "DOUALA", code: "00001", account_number: "00015155057", bank: findBankName("CITIBANK BEPANDA") },
    { name: "ECOBANK SIEGE", town: "DOUALA", code: "00001", account_number: "30180012040", bank: findBankName("ECOBANK SIEGE") },
    { name: "ECOBANK ENCAISSEMENT PREPAID", town: "DOUALA", code: "00001", account_number: "30180036175", bank: findBankName("ECOBANK ENCAISSEMENT PREPAID") },
    { name: "ECOBANK LIMBE", town: "LIMBE", code: "26015", account_number: "31090000687", bank: findBankName("ECOBANK LIMBE") },
    { name: "ECOBANK NDOGPASSI", town: "DOUALA", code: "00001", account_number: "30180044077", bank: findBankName("ECOBANK NDOGPASSI") },
    { name: "ECOBANK BAMENDA", town: "BAMENDA", code: "26020", account_number: "31415000271", bank: findBankName("ECOBANK BAMENDA") },
    { name: "ECOBANK KUMBA", town: "KUMBA", code: "00009", account_number: "30700000064", bank: findBankName("ECOBANK KUMBA") },
    { name: "ECOBANK BUEA", town: "BUEA", code: "26022", account_number: "31545007775", bank: findBankName("ECOBANK BUEA") },
    { name: "SGC (SIEGE)", town: "DOUALA", code: "00100", account_number: "22000341893", bank: findBankName("SGC (SIEGE)") },
    { name: "SGC CLIENTS SPECIAUX", town: "DOUALA", code: "00200", account_number: "05000066477", bank: findBankName("SGC CLIENTS SPECIAUX") },
    { name: "SGC BASSA", town: "DOUALA", code: "00100", account_number: "05010353972", bank: findBankName("SGC BASSA") },
    { name: "SGC BONABERI NORD", town: "DOUALA", code: "00100", account_number: "05010354141", bank: findBankName("SGC BONABERI NORD") },
    { name: "SGC BONABERI SUD", town: "DOUALA", code: "00100", account_number: "05010354142", bank: findBankName("SGC BONABERI SUD") },
    { name: "SGC BONAMOUSSADI", town: "DOUALA", code: "00100", account_number: "05010354144", bank: findBankName("SGC BONAMOUSSADI") },
    { name: "SGC MAROUA", town: "MAROUA", code: "00100", account_number: "05010354151", bank: findBankName("SGC MAROUA") },
    { name: "SGC GAROUA", town: "GAROUA", code: "00100", account_number: "05010354153", bank: findBankName("SGC GAROUA") },
    { name: "SGC NGAOUNDERE", town: "NGAOUNDERE", code: "00100", account_number: "05010354154", bank: findBankName("SGC NGAOUNDERE") },
    { name: "SGC ESSOS", town: "YAOUNDE", code: "00100", account_number: "05010354149", bank: findBankName("SGC ESSOS") },
    { name: "SGC ETOUDI", town: "YAOUNDE", code: "00100", account_number: "05010354146", bank: findBankName("SGC ETOUDI") },
    { name: "SGC RECETTE DSCHANG", town: "DSCHANG", code: "00100", account_number: "05010568348", bank: findBankName("SGC RECETTE DSCHANG") },
    { name: "SGC RECETTE BERTOUA", town: "BERTOUA", code: "00100", account_number: "05010568349", bank: findBankName("SGC RECETTE BERTOUA") },
    { name: "SGC RECETTE BILLES", town: "DOUALA", code: "00100", account_number: "05010568351", bank: findBankName("SGC RECETTE BILLES") },
    { name: "SGC RECETTE KRIBI", town: "KRIBI", code: "00100", account_number: "0 5010763080", bank: findBankName("SGC RECETTE KRIBI") },
    { name: "SGC RECETTE EDEA", town: "EDEA", code: "00100", account_number: "0 5010763079", bank: findBankName("SGC RECETTE EDEA") },
    { name: "SGC ENCAISSEMENT SGC-YUP", town: "DOUALA", code: "00100", account_number: "0 5010903267", bank: findBankName("SGC ENCAISSEMENT SGC-YUP") },
    { name: "SGC PETTY CASH", town: "DOUALA", code: "00100", account_number: "0 5010903275", bank: findBankName("SGC PETTY CASH") },
    { name: "SGC DRSA (SGC- DRSA)", town: "KRIBI", code: "00100", account_number: "0 5010969411", bank: findBankName("SGC DRSA (SGC- DRSA)") },
    { name: "SGC PERACE", town: "DOUALA", code: "00100", account_number: "0 5011463686", bank: findBankName("SGC PERACE") },
    { name: "STANDARD BANK (SIEGE)", town: "DOUALA", code: "00100", account_number: "040-114 379 00", bank: findBankName("STANDARD BANK (SIEGE)") },
    { name: "STANDARD BANK MIMBOMAN", town: "YAOUNDE", code: "00200", account_number: "040-214 765 00", bank: findBankName("STANDARD BANK MIMBOMAN") },
    { name: "STANDARD BANK CLIENTS SPECIAUX", town: "DOUALA", code: "00200", account_number: "040-214 767 00", bank: findBankName("STANDARD BANK CLIENTS SPECIAUX") },
    { name: "STANDARD BANK SA NLONGKAK", town: "YAOUNDE", code: "00100", account_number: "040-114 379 16", bank: findBankName("STANDARD BANK SA NLONGKAK") },
    { name: "STANDARD BANK SA SIEGE (REVENUE ACCOUNT)", town: "DOUALA", code: "00100", account_number: "040-114 379 02 | 040-114 379 04", bank: findBankName("STANDARD BANK SA SIEGE (REVENUE ACCOUNT)") },
    // { name: "STANDARD BANK SA SIEGE (REVENUE ACCOUNT)", town: "DOUALA", code: "00100", account_number: "040-114 379 04", bank: findBankName("STANDARD BANK SA SIEGE (REVENUE ACCOUNT)") },
    { name: "UBA (SIEGE)", town: "DOUALA", code: "05201", account_number: "01003000261", bank: findBankName("UBA (SIEGE)") },
    { name: "UBA - RECETTES OUEST", town: "BAFOUSSAM", code: "05201", account_number: "01003000311", bank: findBankName("UBA - RECETTES OUEST") },
    { name: "UBA - RECETTESNEW BELL", town: "DOUALA", code: "05201", account_number: "01003000331", bank: findBankName("UBA - RECETTESNEW BELL") },
    { name: "UBA - RECETTES NKOLBIKOK", town: "YAOUNDE", code: "05201", account_number: "01003000332", bank: findBankName("UBA - RECETTES NKOLBIKOK") },
    { name: "UBA - RECETTES BIYEM ASSI", town: "YAOUNDE", code: "05201", account_number: "01003000334", bank: findBankName("UBA - RECETTES BIYEM ASSI") },
    { name: "UBA - RECETTES MOUNGO", town: "NKONSAMBA", code: "05201", account_number: "01003000335", bank: findBankName("UBA - RECETTES MOUNGO") },
    { name: "UBA - RECETTES KONDENGUI", town: "YAOUNDE", code: "05201", account_number: "01003000333", bank: findBankName("UBA - RECETTES KONDENGUI") },
    { name: "UBA - ENCAISSEMENT", town: "DOUALA", code: "05201", account_number: "01003000490", bank: findBankName("UBA - ENCAISSEMENT") },
    { name: "UBC (SIEGE)", town: "DOUALA", code: "00020", account_number: "00213020765", bank: findBankName("UBC (SIEGE)") },
    { name: "UBC PALMIERS", town: "DOUALA", code: "00020", account_number: "00213020762", bank: findBankName("UBC PALMIERS") },
    { name: "UBC PK21", town: "DOUALA", code: "00020", account_number: "00213020763", bank: findBankName("UBC PK21") },
    { name: "GBC (SIEGE)", town: "DOUALA", code: "00020", account_number: "00213020765", bank: findBankName("GBC (SIEGE)") }
];


export async function seed_bankAgencies() {
    const existing = await (new AuthService()).getUserSYSTEM();

    if (!existing) {
        return
    }

    const createdBankAgencies: BankAgency[] = [];

    for (const agency of bankAgencies) {
        // Find the bank by code
        const bank = await prisma.bank.findFirst({
            where: { name: agency.bank },
        });

        if (bank) {
            // Create the bank agency
            const createdBankAgency = await prisma.bankAgency.create({
                data: {
                    name: agency.name,
                    code: agency.code,
                    town: agency.town,
                    account_number: agency.account_number,
                    bankId: bank.id,
                    createdBy: existing.id,
                    updatedBy: existing.id
                },
            });
            createdBankAgencies.push(createdBankAgency);
        } else {
            console.log(`❌ Bank with name ${agency.name} not found`);
        }
    }

    console.log(`✅ Created banks Agencies`);
    console.log(`${createdBankAgencies.map(item => item.name).join(', ')}`);
    createdBankAgencies.forEach(item => {
        console.log(`- ${item.name.padEnd(40)} with id : ${item.id}`);
    });
}

