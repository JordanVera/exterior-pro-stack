export type HoustonZip = {
  zip: string;
  label: string;
};

export type HoustonZipGroup = {
  id: string;
  name: string;
  zips: HoustonZip[];
};

export const HOUSTON_ZIP_GROUPS: HoustonZipGroup[] = [
  {
    id: 'central',
    name: 'Inner Loop & Central',
    zips: [
      { zip: '77002', label: 'Downtown' },
      { zip: '77003', label: 'EaDo' },
      { zip: '77004', label: 'Museum District' },
      { zip: '77006', label: 'Montrose' },
      { zip: '77007', label: 'Washington Ave' },
      { zip: '77010', label: 'Downtown' },
      { zip: '77011', label: 'East End' },
      { zip: '77019', label: 'River Oaks' },
      { zip: '77020', label: 'Fifth Ward' },
      { zip: '77026', label: 'Fifth Ward' },
      { zip: '77046', label: 'Greenway Plaza' },
      { zip: '77098', label: 'Upper Kirby' },
    ],
  },
  {
    id: 'heights',
    name: 'Heights, Garden Oaks & Oak Forest',
    zips: [
      { zip: '77008', label: 'Houston Heights' },
      { zip: '77009', label: 'Near Northside' },
      { zip: '77018', label: 'Garden Oaks' },
      { zip: '77022', label: 'Northside' },
      { zip: '77076', label: 'Northside' },
      { zip: '77091', label: 'Acres Homes' },
      { zip: '77092', label: 'Oak Forest' },
    ],
  },
  {
    id: 'uptown',
    name: 'Uptown, Galleria & Memorial',
    zips: [
      { zip: '77024', label: 'Memorial' },
      { zip: '77027', label: 'Highland Village' },
      { zip: '77036', label: 'Sharpstown' },
      { zip: '77042', label: 'Westchase' },
      { zip: '77056', label: 'Uptown' },
      { zip: '77057', label: 'Galleria' },
      { zip: '77063', label: 'Woodlake' },
      { zip: '77074', label: 'Sharpstown' },
      { zip: '77081', label: 'Gulfton' },
    ],
  },
  {
    id: 'west',
    name: 'West Houston & Energy Corridor',
    zips: [
      { zip: '77040', label: 'Jersey Village' },
      { zip: '77041', label: 'NW Houston' },
      { zip: '77043', label: 'Spring Branch' },
      { zip: '77055', label: 'Spring Branch' },
      { zip: '77072', label: 'Alief' },
      { zip: '77077', label: 'Energy Corridor' },
      { zip: '77079', label: 'Energy Corridor' },
      { zip: '77080', label: 'Spring Branch' },
      { zip: '77082', label: 'Westpark' },
      { zip: '77083', label: 'Mission Bend' },
      { zip: '77084', label: 'Copperfield' },
      { zip: '77094', label: 'Energy Corridor' },
      { zip: '77095', label: 'Copperfield' },
      { zip: '77099', label: 'Alief' },
    ],
  },
  {
    id: 'north',
    name: 'North Houston & Champions',
    zips: [
      { zip: '77014', label: 'Champions' },
      { zip: '77032', label: 'Aldine / IAH' },
      { zip: '77037', label: 'Aldine' },
      { zip: '77038', label: 'Aldine' },
      { zip: '77039', label: 'Aldine' },
      { zip: '77060', label: 'Greenspoint' },
      { zip: '77064', label: 'Willowbrook' },
      { zip: '77065', label: 'FM 1960' },
      { zip: '77066', label: 'Champions' },
      { zip: '77067', label: 'Greenspoint' },
      { zip: '77068', label: 'Champions' },
      { zip: '77069', label: 'Champions' },
      { zip: '77070', label: 'Cypresswood' },
      { zip: '77073', label: 'North Houston' },
      { zip: '77086', label: 'NW Houston' },
      { zip: '77088', label: 'Acres Homes' },
      { zip: '77090', label: 'North Houston' },
    ],
  },
  {
    id: 'east',
    name: 'East Houston',
    zips: [
      { zip: '77012', label: 'East End' },
      { zip: '77013', label: 'East Houston' },
      { zip: '77015', label: 'Channelview' },
      { zip: '77016', label: 'Northeast' },
      { zip: '77028', label: 'Northeast' },
      { zip: '77029', label: 'Galena Park' },
      { zip: '77044', label: 'Summerwood' },
      { zip: '77049', label: 'East Houston' },
      { zip: '77050', label: 'North Belt' },
      { zip: '77078', label: 'Northeast' },
      { zip: '77093', label: 'Northeast' },
    ],
  },
  {
    id: 'south',
    name: 'South & Southeast Houston',
    zips: [
      { zip: '77017', label: 'Park Place' },
      { zip: '77021', label: 'MacGregor' },
      { zip: '77023', label: 'Eastwood' },
      { zip: '77033', label: 'South Park' },
      { zip: '77034', label: 'South Belt' },
      { zip: '77045', label: 'SW Houston' },
      { zip: '77047', label: 'South Houston' },
      { zip: '77048', label: 'South Houston' },
      { zip: '77051', label: 'Sunnyside' },
      { zip: '77053', label: 'Fort Bend Houston' },
      { zip: '77061', label: 'Hobby' },
      { zip: '77075', label: 'Gulf Freeway' },
      { zip: '77085', label: 'SW Houston' },
      { zip: '77087', label: 'Gulfgate' },
      { zip: '77089', label: 'Ellington' },
    ],
  },
  {
    id: 'med-center',
    name: 'Medical Center, Bellaire, West U & Meyerland',
    zips: [
      { zip: '77005', label: 'West University' },
      { zip: '77025', label: 'Braeswood' },
      { zip: '77030', label: 'Medical Center' },
      { zip: '77031', label: 'Braeburn' },
      { zip: '77035', label: 'Meyerland' },
      { zip: '77054', label: 'Med Center South' },
      { zip: '77071', label: 'Southwest' },
      { zip: '77096', label: 'Meyerland' },
      { zip: '77401', label: 'Bellaire' },
    ],
  },
  {
    id: 'katy',
    name: 'Katy & Cinco Ranch',
    zips: [
      { zip: '77449', label: 'Katy' },
      { zip: '77450', label: 'Katy' },
      { zip: '77493', label: 'Katy' },
      { zip: '77494', label: 'Cinco Ranch' },
    ],
  },
  {
    id: 'cypress',
    name: 'Cypress & Bridgeland',
    zips: [
      { zip: '77429', label: 'Cypress' },
      { zip: '77433', label: 'Bridgeland' },
    ],
  },
  {
    id: 'fort-bend',
    name: 'Sugar Land, Missouri City & Stafford',
    zips: [
      { zip: '77459', label: 'Missouri City' },
      { zip: '77477', label: 'Stafford' },
      { zip: '77478', label: 'Sugar Land' },
      { zip: '77479', label: 'Sugar Land' },
      { zip: '77489', label: 'Missouri City' },
      { zip: '77498', label: 'Sugar Land' },
    ],
  },
  {
    id: 'richmond',
    name: 'Richmond, Rosenberg & Fulshear',
    zips: [
      { zip: '77406', label: 'Richmond' },
      { zip: '77407', label: 'Richmond' },
      { zip: '77423', label: 'Brookshire' },
      { zip: '77441', label: 'Fulshear' },
      { zip: '77469', label: 'Richmond' },
      { zip: '77471', label: 'Rosenberg' },
    ],
  },
  {
    id: 'pearland',
    name: 'Pearland, Friendswood & Manvel',
    zips: [
      { zip: '77511', label: 'Alvin' },
      { zip: '77546', label: 'Friendswood' },
      { zip: '77578', label: 'Manvel' },
      { zip: '77581', label: 'Pearland' },
      { zip: '77583', label: 'Rosharon' },
      { zip: '77584', label: 'Pearland' },
    ],
  },
  {
    id: 'woodlands',
    name: 'The Woodlands',
    zips: [
      { zip: '77380', label: 'The Woodlands' },
      { zip: '77381', label: 'The Woodlands' },
      { zip: '77382', label: 'The Woodlands' },
      { zip: '77384', label: 'Shenandoah' },
      { zip: '77385', label: 'Oak Ridge North' },
      { zip: '77389', label: 'Spring / Woodlands' },
    ],
  },
  {
    id: 'spring',
    name: 'Spring, Tomball & Magnolia',
    zips: [
      { zip: '77354', label: 'Magnolia' },
      { zip: '77355', label: 'Magnolia' },
      { zip: '77373', label: 'Spring' },
      { zip: '77375', label: 'Tomball' },
      { zip: '77377', label: 'Tomball' },
      { zip: '77379', label: 'Spring' },
      { zip: '77386', label: 'Spring' },
      { zip: '77388', label: 'Spring' },
    ],
  },
  {
    id: 'conroe',
    name: 'Conroe & Montgomery',
    zips: [
      { zip: '77301', label: 'Conroe' },
      { zip: '77302', label: 'Conroe' },
      { zip: '77303', label: 'Conroe' },
      { zip: '77304', label: 'Conroe' },
      { zip: '77306', label: 'Conroe' },
      { zip: '77316', label: 'Montgomery' },
      { zip: '77318', label: 'Willis' },
      { zip: '77356', label: 'Montgomery' },
    ],
  },
  {
    id: 'bay-area',
    name: 'League City, Clear Lake & Bay Area',
    zips: [
      { zip: '77058', label: 'NASA / Nassau Bay' },
      { zip: '77059', label: 'Clear Lake' },
      { zip: '77062', label: 'Clear Lake' },
      { zip: '77510', label: 'Santa Fe' },
      { zip: '77517', label: 'Santa Fe' },
      { zip: '77518', label: 'Bacliff' },
      { zip: '77539', label: 'Dickinson' },
      { zip: '77565', label: 'Kemah' },
      { zip: '77568', label: 'La Marque' },
      { zip: '77573', label: 'League City' },
      { zip: '77586', label: 'Seabrook' },
      { zip: '77590', label: 'Texas City' },
      { zip: '77591', label: 'Texas City' },
      { zip: '77598', label: 'Webster' },
    ],
  },
  {
    id: 'humble',
    name: 'Humble, Kingwood & Atascocita',
    zips: [
      { zip: '77336', label: 'Huffman' },
      { zip: '77338', label: 'Humble' },
      { zip: '77339', label: 'Kingwood' },
      { zip: '77345', label: 'Kingwood' },
      { zip: '77346', label: 'Atascocita' },
      { zip: '77357', label: 'New Caney' },
      { zip: '77365', label: 'Porter' },
      { zip: '77396', label: 'Humble' },
    ],
  },
  {
    id: 'east-harris',
    name: 'Pasadena, Deer Park, Baytown & La Porte',
    zips: [
      { zip: '77502', label: 'Pasadena' },
      { zip: '77503', label: 'Pasadena' },
      { zip: '77504', label: 'Pasadena' },
      { zip: '77505', label: 'Pasadena' },
      { zip: '77506', label: 'Pasadena' },
      { zip: '77507', label: 'Pasadena' },
      { zip: '77520', label: 'Baytown' },
      { zip: '77521', label: 'Baytown' },
      { zip: '77523', label: 'Baytown' },
      { zip: '77530', label: 'Channelview' },
      { zip: '77532', label: 'Crosby' },
      { zip: '77536', label: 'Deer Park' },
      { zip: '77547', label: 'Galena Park' },
      { zip: '77571', label: 'La Porte' },
    ],
  },
];

export const HOUSTON_ZIPS = HOUSTON_ZIP_GROUPS.flatMap((group) =>
  group.zips.map((item) => item.zip),
);

export const HOUSTON_ZIP_SET = new Set(HOUSTON_ZIPS);

export function houstonZipLabel(zip: string) {
  for (const group of HOUSTON_ZIP_GROUPS) {
    const match = group.zips.find((item) => item.zip === zip);
    if (match) return match.label;
  }
  return null;
}
