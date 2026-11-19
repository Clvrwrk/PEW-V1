/** Case study field photos — mirrors manifest.csv; assets live under public case-study folders. */
export type CaseStudyPhotoStage = 'before' | 'during' | 'after';

export interface CaseStudyPhotoManifestEntry {
  id: string;
  image: string;
  imageAlt: string;
  stage: CaseStudyPhotoStage;
  workType: 'tpo' | 'epdm' | 'leak' | 'coating' | 'reroof';
  caseStudy: 'texas-motor-speedway' | 'dallas-church';
  takenAt: string;
}

export const CASE_STUDY_PHOTOS: CaseStudyPhotoManifestEntry[] = [
  { id: 'tms-tpo-aerial', image: '/images/case-studies/texas-motor-speedway/tms-main-office-existing-membrane-aerial.webp', imageAlt: 'Aerial of the existing dark membrane on the Texas Motor Speedway main office roof, outlined in red, with the glass facade and track visible.', stage: 'before', workType: 'tpo', caseStudy: 'texas-motor-speedway', takenAt: '2025-04-21' },
  { id: 'tms-tpo-vents', image: '/images/case-studies/texas-motor-speedway/tms-main-office-existing-membrane-vents.webp', imageAlt: 'Existing dark membrane, vents, and red coping on the Texas Motor Speedway main office roof before TPO replacement.', stage: 'before', workType: 'tpo', caseStudy: 'texas-motor-speedway', takenAt: '2025-04-15' },
  { id: 'tms-tpo-crane', image: '/images/case-studies/texas-motor-speedway/tms-main-office-tpo-crane-materials.webp', imageAlt: 'A crane lifts materials onto the Texas Motor Speedway main office roof during TPO replacement.', stage: 'during', workType: 'tpo', caseStudy: 'texas-motor-speedway', takenAt: '2025-06-04' },
  { id: 'tms-tpo-tearoff', image: '/images/case-studies/texas-motor-speedway/tms-main-office-tpo-tearoff-overview.webp', imageAlt: 'Texas Motor Speedway main office roof mid-replacement, with insulation and cover boards staged beside the track.', stage: 'during', workType: 'tpo', caseStudy: 'texas-motor-speedway', takenAt: '2025-06-14' },
  { id: 'tms-tpo-deck', image: '/images/case-studies/texas-motor-speedway/tms-main-office-rusted-metal-deck.webp', imageAlt: 'Rusted corrugated metal roof deck with a puncture, exposed during TPO replacement at the Texas Motor Speedway main office.', stage: 'during', workType: 'tpo', caseStudy: 'texas-motor-speedway', takenAt: '2025-06-14' },
  { id: 'tms-tpo-densdeck', image: '/images/case-studies/texas-motor-speedway/tms-main-office-densdeck-cover-board.webp', imageAlt: 'DensDeck cover board fastened over the new deck during TPO replacement at the Texas Motor Speedway main office.', stage: 'during', workType: 'tpo', caseStudy: 'texas-motor-speedway', takenAt: '2025-06-14' },
  { id: 'tms-tpo-overlay-survey', image: '/images/case-studies/texas-motor-speedway/tms-media-center-ballasted-roof-grandstand.webp', imageAlt: 'Ballasted roof beside the Texas Motor Speedway grandstand, surveyed before a TPO overlay at the media center.', stage: 'before', workType: 'tpo', caseStudy: 'texas-motor-speedway', takenAt: '2025-08-20' },
  { id: 'tms-leak-interior', image: '/images/case-studies/texas-motor-speedway/tms-concession-merchandise-shop-interior.webp', imageAlt: 'Interior of a Texas Motor Speedway merchandise shop beneath a leaking concession roof, with apparel and brand logos on the wall.', stage: 'before', workType: 'leak', caseStudy: 'texas-motor-speedway', takenAt: '2025-04-23' },
  { id: 'tms-leak-marks', image: '/images/case-studies/texas-motor-speedway/tms-concession-leak-marks-circled.webp', imageAlt: 'Weathered white membrane on a Texas Motor Speedway concession roof with leak locations circled in red.', stage: 'before', workType: 'leak', caseStudy: 'texas-motor-speedway', takenAt: '2025-04-23' },
  { id: 'tms-leak-aerial', image: '/images/case-studies/texas-motor-speedway/tms-concession-leak-areas-aerial.webp', imageAlt: 'Aerial of a weathered Texas Motor Speedway concession roof under a Sunoco 94 banner, surveyed for leak repairs.', stage: 'before', workType: 'leak', caseStudy: 'texas-motor-speedway', takenAt: '2025-04-25' },
  { id: 'tms-leak-drain', image: '/images/case-studies/texas-motor-speedway/tms-concession-new-roof-drain.webp', imageAlt: 'A newly set roof drain flashed into the weathered membrane on a Texas Motor Speedway concession stand.', stage: 'during', workType: 'leak', caseStudy: 'texas-motor-speedway', takenAt: '2025-04-23' },
  { id: 'tms-leak-seam', image: '/images/case-studies/texas-motor-speedway/tms-concession-failed-membrane-seam.webp', imageAlt: 'Failed, peeling membrane and an open seam on a Texas Motor Speedway concession-stand roof.', stage: 'before', workType: 'leak', caseStudy: 'texas-motor-speedway', takenAt: '2025-04-23' },
  { id: 'tms-leak-bighaus-after', image: '/images/case-studies/texas-motor-speedway/tms-big-haus-repaired-membrane-aerial.webp', imageAlt: 'Aerial of the Texas Motor Speedway Big Haus storage roof after leak repairs, with a large white patched area on the black membrane.', stage: 'after', workType: 'leak', caseStudy: 'texas-motor-speedway', takenAt: '2025-05-08' },
  { id: 'tms-epdm-drain', image: '/images/case-studies/texas-motor-speedway/tms-media-center-epdm-drain-ballast.webp', imageAlt: 'Ballast pulled back from a drain on the ballasted EPDM roof at the Texas Motor Speedway media center, with leak marks in red.', stage: 'before', workType: 'epdm', caseStudy: 'texas-motor-speedway', takenAt: '2025-04-23' },
  { id: 'tms-coating-survey-roof', image: '/images/case-studies/texas-motor-speedway/tms-concession-weathered-roof-before-coating.webp', imageAlt: 'Weathered white roof on a Texas Motor Speedway concession building beside the grandstand, surveyed before a Soprema coating system.', stage: 'before', workType: 'coating', caseStudy: 'texas-motor-speedway', takenAt: '2025-08-20' },
  { id: 'tms-coating-survey-vents', image: '/images/case-studies/texas-motor-speedway/tms-concession-vents-before-coating.webp', imageAlt: 'Turbine vents and ponding stains on a weathered Texas Motor Speedway concession roof, surveyed before a Soprema coating system.', stage: 'before', workType: 'coating', caseStudy: 'texas-motor-speedway', takenAt: '2025-08-20' },
  { id: 'church-core', image: '/images/case-studies/dallas-church/dallas-church-roof-core-cut.webp', imageAlt: 'Core cut at a Dallas church showing deteriorated roof layers down to the wood deck.', stage: 'before', workType: 'reroof', caseStudy: 'dallas-church', takenAt: '2026-07-28' },
  { id: 'church-edge', image: '/images/case-studies/dallas-church/dallas-church-failed-roof-edge-layers.webp', imageAlt: 'Failed roof-edge layers and rusted metal at a Dallas church, exposed during a reroof survey.', stage: 'before', workType: 'reroof', caseStudy: 'dallas-church', takenAt: '2026-07-28' },
  { id: 'church-fascia', image: '/images/case-studies/dallas-church/dallas-church-deteriorated-fascia-gutter.webp', imageAlt: 'Deteriorated fascia and debris in the gutter at the metal roof edge of a Dallas church.', stage: 'before', workType: 'reroof', caseStudy: 'dallas-church', takenAt: '2026-07-28' },
  { id: 'church-interior', image: '/images/case-studies/dallas-church/dallas-church-interior-leak-opening.webp', imageAlt: 'Interior opening at a Dallas church showing a pipe chase and damaged drywall from a roof leak.', stage: 'before', workType: 'reroof', caseStudy: 'dallas-church', takenAt: '2026-07-28' },
  { id: 'church-underside', image: '/images/case-studies/dallas-church/dallas-church-metal-deck-underside.webp', imageAlt: 'Underside of the metal roof deck and purlins in the attic of a Dallas church.', stage: 'before', workType: 'reroof', caseStudy: 'dallas-church', takenAt: '2026-07-28' },
  { id: 'church-downspout', image: '/images/case-studies/dallas-church/dallas-church-downspout-discharge.webp', imageAlt: 'A downspout at a Dallas church discharging onto the ground at the base of the wall.', stage: 'before', workType: 'reroof', caseStudy: 'dallas-church', takenAt: '2026-07-28' },
];

const byId = Object.fromEntries(CASE_STUDY_PHOTOS.map((p) => [p.id, p])) as Record<string, CaseStudyPhotoManifestEntry>;

export function resolveCaseStudyPhotos(ids: string[]): CaseStudyPhotoManifestEntry[] {
  return ids.map((id) => byId[id]).filter(Boolean);
}

export const COMMERCIAL_SERVICE_PHOTOS: Record<string, string[]> = {
  repair: [
    'tms-leak-marks',
    'tms-leak-aerial',
    'tms-leak-bighaus-after',
    'tms-tpo-aerial',
    'tms-tpo-tearoff',
    'church-interior',
    'church-core',
  ],
  'tpo-roofing-systems': ['tms-tpo-aerial', 'tms-tpo-vents', 'tms-tpo-crane', 'tms-tpo-tearoff', 'tms-tpo-deck', 'tms-tpo-densdeck', 'tms-tpo-overlay-survey'],
  epdm: ['tms-epdm-drain'],
  'roof-coatings': ['tms-coating-survey-roof', 'tms-coating-survey-vents'],
  'flat-roof-repair': ['tms-leak-seam', 'tms-leak-aerial', 'church-core', 'church-edge', 'church-underside'],
  'leak-repair': ['tms-leak-interior', 'tms-leak-marks', 'tms-leak-seam', 'tms-leak-drain', 'tms-leak-bighaus-after', 'church-interior'],
};

export const COMMERCIAL_CITY_PHOTOS: Record<string, string[]> = {
  'commercial-dallas': [
    'church-core',
    'church-edge',
    'church-interior',
    'church-fascia',
    'church-downspout',
    'church-underside',
    'tms-tpo-aerial',
    'tms-leak-bighaus-after',
  ],
};