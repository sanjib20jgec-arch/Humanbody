// Curated anatomical facts for the Movement Theater (Phase 74, M5/M7).
// Teaching-level (OpenStax A&P consensus). No clinical claims.
// plane: dominant plane of action. side: true if the muscle is paired.

export const MUSCLE_FACTS = {
  quadriceps: { name: 'Quadriceps femoris (vastii)', latin: 'm. quadriceps femoris', plane: 'Sagittal', origin: 'Femoral shaft and linea aspera', insertion: 'Tibial tuberosity via patellar ligament', action: 'Extends the knee' },
  rectusFemoris: { name: 'Rectus femoris', latin: 'm. rectus femoris', plane: 'Sagittal', origin: 'Anterior inferior iliac spine', insertion: 'Patellar ligament to tibial tuberosity', action: 'Extends knee; flexes hip' },
  hamstrings: { name: 'Hamstrings', latin: 'mm. biceps femoris, semitendinosus, semimembranosus', plane: 'Sagittal', origin: 'Ischial tuberosity', insertion: 'Proximal tibia and fibula', action: 'Flexes knee; extends hip' },
  gluteusMaximus: { name: 'Gluteus maximus', latin: 'm. gluteus maximus', plane: 'Sagittal', origin: 'Ilium, sacrum, coccyx', insertion: 'Gluteal tuberosity and iliotibial tract', action: 'Powerful hip extension' },
  gluteusMedius: { name: 'Gluteus medius', latin: 'm. gluteus medius', plane: 'Frontal', origin: 'External iliac surface', insertion: 'Greater trochanter', action: 'Abducts hip; steadies pelvis in stance' },
  iliopsoas: { name: 'Iliopsoas', latin: 'm. iliopsoas', plane: 'Sagittal', origin: 'Lumbar vertebrae and iliac fossa', insertion: 'Lesser trochanter', action: 'Flexes the hip' },
  gastrocnemius: { name: 'Gastrocnemius', latin: 'm. gastrocnemius', plane: 'Sagittal', origin: 'Femoral condyles', insertion: 'Calcaneus via calcaneal tendon', action: 'Plantarflexes ankle; flexes knee' },
  soleus: { name: 'Soleus', latin: 'm. soleus', plane: 'Sagittal', origin: 'Posterior tibia and fibula', insertion: 'Calcaneus via calcaneal tendon', action: 'Plantarflexes ankle (posture)' },
  tibialisAnterior: { name: 'Tibialis anterior', latin: 'm. tibialis anterior', plane: 'Sagittal', origin: 'Lateral tibia', insertion: 'Medial cuneiform and 1st metatarsal', action: 'Dorsiflexes and inverts foot' },
  rectusAbdominis: { name: 'Rectus abdominis', latin: 'm. rectus abdominis', plane: 'Sagittal', origin: 'Pubic crest', insertion: 'Costal cartilages 5–7, xiphoid', action: 'Flexes trunk; core stiffness' },
  erectorSpinae: { name: 'Erector spinae', latin: 'm. erector spinae', plane: 'Sagittal', origin: 'Sacrum, iliac crest, vertebrae', insertion: 'Vertebrae, ribs, skull', action: 'Extends trunk; posture' },
  obliquusExternus: { name: 'External oblique', latin: 'm. obliquus externus abdominis', plane: 'Transverse', origin: 'Lower eight ribs', insertion: 'Iliac crest and inguinal ligament', action: 'Trunk flexion/rotation; core support' },
  latissimusDorsi: { name: 'Latissimus dorsi', latin: 'm. latissimus dorsi', plane: 'Sagittal', origin: 'Lower vertebrae and iliac crest', insertion: 'Intertubercular groove of humerus', action: 'Extends/adducts arm; arm-drive in gait' },
  serratusAnterior: { name: 'Serratus anterior', latin: 'm. serratus anterior', plane: 'Frontal', origin: 'Upper eight ribs', insertion: 'Medial scapular border', action: 'Protracts and upward-rotates scapula' },
  upperTrapezius: { name: 'Trapezius (upper)', latin: 'm. trapezius, pars descendens', plane: 'Frontal', origin: 'External occipital protuberance, nuchal ligament', insertion: 'Lateral clavicle', action: 'Elevates and upward-rotates scapula' },
  supraspinatus: { name: 'Supraspinatus', latin: 'm. supraspinatus', plane: 'Frontal', origin: 'Supraspinous fossa', insertion: 'Greater tubercle of humerus', action: 'Initiates arm abduction' },
  deltoid: { name: 'Deltoid', latin: 'm. deltoideus', plane: 'Frontal', origin: 'Clavicle, acromion, scapular spine', insertion: 'Deltoid tuberosity of humerus', action: 'Abducts arm (middle fibres)' },
  bicepsBrachii: { name: 'Biceps brachii', latin: 'm. biceps brachii', plane: 'Sagittal', origin: 'Scapula (two heads)', insertion: 'Radial tuberosity', action: 'Flexes elbow; supinates forearm' },
  tricepsBrachii: { name: 'Triceps brachii', latin: 'm. triceps brachii', plane: 'Sagittal', origin: 'Scapula and humerus', insertion: 'Olecranon of ulna', action: 'Extends the elbow' },
  forearmFlexors: { name: 'Forearm flexor group', latin: 'mm. flexores carpi et digitorum', plane: 'Sagittal', origin: 'Medial epicondyle', insertion: 'Carpals, metacarpals, phalanges', action: 'Flexes wrist and fingers (grip)' },
  forearmExtensors: { name: 'Forearm extensor group', latin: 'mm. extensores carpi', plane: 'Sagittal', origin: 'Lateral epicondyle', insertion: 'Carpals and metacarpals', action: 'Extends wrist' },
  pronatorTeres: { name: 'Pronator teres', latin: 'm. pronator teres', plane: 'Transverse', origin: 'Medial epicondyle and coronoid process', insertion: 'Mid-lateral radius', action: 'Pronates forearm' },
  adductorPollicis: { name: 'Adductor pollicis (thenar)', latin: 'm. adductor pollicis', plane: 'Frontal', origin: 'Capitate and metacarpals', insertion: 'Proximal phalanx of thumb', action: 'Adducts thumb — power grip' },
  masseter: { name: 'Masseter', latin: 'm. masseter', plane: 'Sagittal', origin: 'Zygomatic arch', insertion: 'Ramus of mandible', action: 'Elevates jaw (biting force)' },
  temporalis: { name: 'Temporalis', latin: 'm. temporalis', plane: 'Sagittal', origin: 'Temporal fossa', insertion: 'Coronoid process of mandible', action: 'Elevates and retracts jaw' },
  lateralPterygoid: { name: 'Lateral pterygoid', latin: 'm. pterygoideus lateralis', plane: 'Transverse', origin: 'Lateral pterygoid plate', insertion: 'Mandibular condyle', action: 'Protrudes jaw; side-to-side grinding' },
  digastric: { name: 'Digastric', latin: 'm. digastricus', plane: 'Sagittal', origin: 'Mastoid notch and mandible', insertion: 'Hyoid bone', action: 'Depresses jaw; elevates hyoid' },
  orbicularisOris: { name: 'Orbicularis oris', latin: 'm. orbicularis oris', plane: '—', origin: 'Muscle and skin around lips', insertion: 'Lips', action: 'Shapes and closes lips' },
  buccinator: { name: 'Buccinator', latin: 'm. buccinator', plane: '—', origin: 'Maxilla, mandible, pterygomandibular raphe', insertion: 'Orbicularis oris', action: 'Compresses cheek (bolus, speech)' }
};

export const factFor = (key) => MUSCLE_FACTS[key.replace(/\.[LR]$/, '')];
export const sideLabel = (key) => (key.endsWith('.L') ? ' (left)' : key.endsWith('.R') ? ' (right)' : '');
