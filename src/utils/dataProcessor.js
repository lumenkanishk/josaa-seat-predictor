import Papa from 'papaparse';

const NIRF_RANKS_IIT = {
  "madras": 1, "delhi": 2, "bombay": 3, "kanpur": 4, "kharagpur": 5, 
  "roorkee": 6, "hyderabad": 7, "guwahati": 8, "varanasi": 9, "bhu": 9, 
  "indore": 10, "dhanbad": 11, "ism": 11, "patna": 12, "gandhinagar": 13, 
  "mandi": 14, "jodhpur": 15, "ropar": 16, "bhubaneswar": 17, 
  "jammu": 19, "tirupati": 20, "palakkad": 21, "bhilai": 22, "dharwad": 23
};

const NIRF_RANKS_NIT = {
  "tiruchirappalli": 9, "trichy": 9, "surathkal": 12, "rourkela": 19, "warangal": 21, 
  "calicut": 23, "jaipur": 31, "malaviya": 31, "silchar": 40, "nagpur": 43, "visvesvaraya": 43, 
  "durgapur": 43, "jalandhar": 46, "ambedkar": 46, "hamirpur": 47, "kurukshetra": 50, 
  "allahabad": 52, "motilal nehru": 52, "raipur": 57, "bhopal": 65, "maulana azad": 65, 
  "agartala": 74, "goa": 90, "jamshedpur": 95, "patna": 96
};

const getInstituteCategory = (rawName) => {
  const instName = rawName.toLowerCase().replace(/\s+/g, ' ');
  
  const isIIT = instName.includes('indian institute of technology') && !instName.includes('information');
  const isNIT = instName.includes('national institute of technology');
  const isIIIT = instName.includes('information technology');
  const isGFTI = !isIIT && !isIIIT && !isNIT;

  if (isIIT) return 'IIT';
  if (isNIT) return 'NIT';
  if (isIIIT) return 'IIIT';
  return 'GFTI';
};

const getNirfRank = (rawName, category) => {
  const lowerName = rawName.toLowerCase();
  
  if (category === 'IIT') {
    for (const [key, rank] of Object.entries(NIRF_RANKS_IIT)) {
      if (lowerName.includes(key)) return rank;
    }
  } else if (category === 'NIT') {
    for (const [key, rank] of Object.entries(NIRF_RANKS_NIT)) {
      if (lowerName.includes(key)) return rank;
    }
  }
  
  return 999;
};

const parseCleanRank = (val) => {
  if (!val) return 0;
  const cleanStr = String(val).replace(/,/g, '').split('.')[0].trim();
  const parsed = parseInt(cleanStr, 10);
  return isNaN(parsed) ? 0 : parsed;
};

export const fetchAndParseCSV = (round) => {
  return new Promise((resolve, reject) => {
    Papa.parse(`/${round}.csv`, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data);
      },
      error: (err) => {
        reject(err);
      }
    });
  });
};

export const processPredictorData = (data, filters) => {
  const { rank, seatType, gender, instituteType, quota } = filters;
  
  const userRankNum = parseInt(rank, 10);
  const selectedType = (instituteType || "").toLowerCase();
  const selectedQuota = (quota || "").toUpperCase(); // "ALL", "HS", "OS", etc.
  const selectedSeatType = (seatType || "").toUpperCase(); // "OPEN", "OBC-NCL", etc.
  const selectedGender = (gender || "").toLowerCase();

  if (isNaN(userRankNum) || userRankNum <= 0) return [];

  let filtered = data.filter(row => {
    if (!row) return false;
    
    // A. CLEAN AND PARSE THE RANK NUMBERS
    const rawClosing = row['Closing Rank'] ?? row.closingRank ?? "";
    const cleanClosingStr = String(rawClosing).replace(/,/g, '').split('.')[0].trim();
    const closingRankNum = parseInt(cleanClosingStr, 10);

    if (isNaN(closingRankNum) || closingRankNum <= 0) return false;
    if (userRankNum > closingRankNum) return false; // Fail if user's rank is worse than the closing cutoff

    // B. INSTITUTE TYPE SELECTION MATRIX
    const rawInstName = String(row['Institute Name'] ?? row.instituteName ?? "").replace(/\s+/g, ' ').trim().toLowerCase();
    if (!rawInstName) return false;

    if (selectedType !== 'all') {
      if (selectedType.includes('iit') && !selectedType.includes('iiit')) {
        if (!rawInstName.includes('indian institute of technology') || rawInstName.includes('information')) return false;
      } else if (selectedType.includes('nit')) {
        if (!rawInstName.includes('national institute of technology')) return false;
      } else if (selectedType.includes('iiit')) {
        if (!rawInstName.includes('information technology') && !rawInstName.includes('iiit')) return false;
      } else if (selectedType.includes('gfti')) {
        if (rawInstName.includes('indian institute of technology') || rawInstName.includes('national institute of technology')) return false;
      }
    }

    // C. DYNAMIC STATE QUOTA RESOLUTION (FIX FOR HIGH RANKS)
    const rowQuota = String(row['Quota'] ?? row.quota ?? "").toUpperCase().trim();
    if (selectedQuota !== 'ALL' && selectedQuota !== '') {
      if (rowQuota !== selectedQuota) return false;
    }

    // D. SEAT CATEGORY & GENDER COMPULSION MATCH
    const rowSeatType = String(row['Seat Type'] ?? row.seatType ?? "").toUpperCase().trim();
    if (selectedSeatType && selectedSeatType !== 'ALL') {
      if (rowSeatType !== selectedSeatType) return false;
    }

    const rowGender = String(row['Gender'] ?? row.gender ?? "").toLowerCase().trim();
    if (selectedGender && selectedGender !== 'all') {
      // Cross-match 'gender-neutral' and exact matches safely
      if (!rowGender.includes(selectedGender) && !rowGender.includes('neutral')) return false;
    }

    return true; // Row passed all criteria!
  });

  // Group by College
  const collegeMap = new Map();
  
  filtered.forEach(row => {
    const rawName = row['Institute Name'] || row.instituteName || "";
    // Normalize spaces to avoid duplicates like "Institute  of Technology" vs "Institute of Technology"
    const instName = rawName.replace(/\s+/g, ' ').trim();
    
    if (!collegeMap.has(instName)) {
      const normName = instName.toLowerCase();
      const isIIT = normName.includes('indian institute of technology') && !normName.includes('information');
      const isNIT = normName.includes('national institute of technology');
      const isIIIT = normName.includes('information technology');
      
      let category = 'GFTI';
      if (isIIT) category = 'IIT';
      else if (isNIT) category = 'NIT';
      else if (isIIIT) category = 'IIIT';

      collegeMap.set(instName, {
        instituteName: instName,
        nirfRank: getNirfRank(instName, category),
        eligibleBranches: []
      });
    }

    const closingRank = parseCleanRank(row['Closing Rank']);
    
    collegeMap.get(instName).eligibleBranches.push({
      programName: row['Academic Program Name'] || '',
      closingRank: closingRank,
      quota: row['Quota'] || '',
      seatType: row['Seat Type'] || '',
      gender: row['Gender'] || ''
    });
  });

  const groupedResults = Array.from(collegeMap.values());

  // Sort branches within each college by closing rank (ascending)
  groupedResults.forEach(college => {
    college.eligibleBranches.sort((a, b) => a.closingRank - b.closingRank);
  });

  // Master Sort: Primary by NIRF Rank, Secondary by Institute Name alphabetically
  groupedResults.sort((a, b) => {
    if (a.nirfRank !== b.nirfRank) {
      return a.nirfRank - b.nirfRank; // Sort by NIRF Rank Ascending
    }
    const nameA = a.instituteName.toLowerCase();
    const nameB = b.instituteName.toLowerCase();
    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
  });

  return groupedResults;
};
