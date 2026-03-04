import { HfInference } from '@huggingface/inference';

// Initialize Hugging Face (FREE - no API key needed for public models)
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

class AIService {
  constructor() {
    // Using free medical-focused model
    this.model = 'microsoft/BioGPT-Large';
    this.chatModel = 'mistralai/Mistral-7B-Instruct-v0.2';
  }

  /**
   * Chat with AI Medical Assistant
   */
  async chat(message, conversationHistory = []) {
    try {
      // Build context for medical assistant
      const systemPrompt = `You are a knowledgeable and compassionate AI Medical Assistant. 
Provide helpful health information and guidance. Always recommend seeing a healthcare professional for serious concerns.

Patient question: ${message}

Response:`;

      const response = await hf.textGeneration({
        model: this.chatModel,
        inputs: systemPrompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          top_p: 0.95,
          return_full_text: false
        }
      });

      return {
        success: true,
        message: response.generated_text.trim(),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('AI Chat Error:', error);
      // Fallback to basic medical responses
      return {
        success: true,
        message: this.getFallbackResponse(message),
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Fallback responses when AI is unavailable
   */
  getFallbackResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Medication queries
    if (lowerMessage.includes('paracetamol') || lowerMessage.includes('acetaminophen') || lowerMessage.includes('tylenol')) {
      return `PARACETAMOL (ACETAMINOPHEN/TYLENOL) INFORMATION

What it is:
Paracetamol is a common over-the-counter pain reliever and fever reducer.

Uses:
• Reduces fever
• Relieves mild to moderate pain (headaches, muscle aches, backache)
• Generally safe for most people when used correctly

Dosage:
• Adult: 500-1000 mg every 4-6 hours (max 3000-4000 mg per day)
• Take with food if stomach upset occurs
• Never exceed recommended daily dose

How it works:
• Reduces fever by acting on the brain's temperature center
• Relieves pain by altering pain perception
• Takes effect in 30 minutes to 1 hour
• Effects last 4-6 hours

Side Effects:
• Generally well-tolerated
• Rare: Liver damage if overdosed
• Rare: Allergic reactions

Precautions:
• Do NOT exceed recommended dose
• Avoid if you have liver disease
• Caution if you regularly consume alcohol
• Tell doctor if pregnant or breastfeeding
• Can be used with other medications, but check for interactions

When to use:
• Fever from cold/flu
• Headaches or migraines
• General body aches
• Minor surgical pain

Interactions:
• Can be safely combined with most other medications
• Avoid combining with other products containing paracetamol
• Check with pharmacist before combining with other pain relievers

When to contact a doctor:
• Fever lasting more than 3 days
• Pain lasting more than 10 days
• Severe allergic reactions
• Signs of liver problems (yellowing of skin/eyes, dark urine)

Storage:
• Room temperature (59-86°F / 15-30°C)
• Away from light and moisture
• Out of children's reach

DISCLAIMER: Always read the label and follow instructions. If symptoms persist or worsen, consult a healthcare professional.`;
    }
    
    if (lowerMessage.includes('ibuprofen') || lowerMessage.includes('advil') || lowerMessage.includes('brufen')) {
      return `IBUPROFEN (ADVIL/BRUFEN) INFORMATION

What it is:
Ibuprofen is an over-the-counter pain reliever and anti-inflammatory medication.

Uses:
• Reduces fever
• Relieves mild to moderate pain
• Reduces inflammation and swelling
• Helps with headaches, muscle aches, menstrual pain

Dosage:
• Adult: 200-400 mg every 4-6 hours (max 1200 mg per day without prescription)
• Take with food to minimize stomach upset
• Do not exceed recommended daily dose

How it works:
• Anti-inflammatory - reduces swelling and inflammation
• Analgesic - relieves pain
• Antipyretic - reduces fever
• Takes effect in 30 minutes to 1 hour

Benefits:
• More effective for inflammation than paracetamol
• Longer-lasting pain relief
• Good for fever and pain together

Precautions:
• Avoid if you have stomach ulcers or GERD
• Use with caution if you have kidney disease
• Not recommended for people with heart disease
• Avoid if allergic to aspirin
• Tell doctor if pregnant or breastfeeding

Side Effects:
• Stomach upset, heartburn (common)
• Nausea
• Rare: Internal bleeding, kidney problems with long-term use
• Rare: Allergic reactions

When to contact a doctor:
• Stomach pain or vomiting blood
• Signs of allergic reaction
• Unexplained weight gain or swelling
• High blood pressure changes
• Black or tarry stools

Storage:
• Room temperature
• Away from moisture and light
• Out of children's reach

IMPORTANT: Do NOT combine with aspirin or other NSAIDs. Check with pharmacist before combining with other medications.`;
    }
    
    if (lowerMessage.includes('fever') || lowerMessage.includes('temperature')) {
      return `FEVER MANAGEMENT

What to do:
• Rest and stay hydrated
• Drink plenty of fluids (water, warm tea, soup)
• Take acetaminophen (Tylenol/Paracetamol) or ibuprofen (Advil) as directed
• Monitor temperature regularly
• Wear light clothing, use light blankets
• Take lukewarm baths if comfortable

When to be concerned:
• Fever exceeds 103°F (39.4°C) - seek medical attention
• Fever lasts more than 3 days
• High fever with severe symptoms (confusion, difficulty breathing)
• Fever in infants under 3 months
• Fever with neck stiffness or severe headache

When to consult a doctor immediately:
• Severe symptoms present
• Underlying health conditions
• Recent surgery or immunocompromised
• Fever accompanied by rash
• Difficulty breathing or chest pain`;
    }
    
    if (lowerMessage.includes('headache') || lowerMessage.includes('head pain')) {
      return `HEADACHE MANAGEMENT

What to do:
• Get adequate rest in a quiet, dark room
• Stay well hydrated - drink water regularly
• Apply cold or warm compress to head or neck
• Try over-the-counter pain relievers (Paracetamol or Ibuprofen)
• Practice relaxation techniques - deep breathing, meditation
• Gentle neck massage or stretching
• Avoid bright lights and loud noises

Prevention:
• Maintain regular sleep schedule
• Manage stress levels
• Stay hydrated throughout the day
• Avoid caffeine withdrawal (reduce slowly)
• Regular exercise

When to see a doctor:
• Severe, sudden headache (worst of your life)
• Frequent or persistent headaches
• Headache with fever, stiff neck, confusion
• Headache after head injury
• Change in headache pattern or severity
• Accompanied by vision changes or weakness`;
    }
    
    if (lowerMessage.includes('cold') || lowerMessage.includes('flu') || lowerMessage.includes('cough')) {
      return `COLD/FLU MANAGEMENT

Symptoms of Cold:
• Runny or stuffy nose
• Sneezing
• Sore throat
• Mild cough
• Low-grade fever
• Body aches
• Fatigue

What to do:
• Rest adequately - get 7-9 hours of sleep
• Drink plenty of fluids - water, warm tea, broth
• Use a humidifier to ease congestion
• Gargle with salt water for sore throat
• Use saline nasal drops or spray
• Eat vitamin C-rich foods (citrus, berries)
• Take over-the-counter medications as needed

Prevention:
• Wash hands frequently with soap and water
• Avoid touching your face
• Disinfect surfaces regularly
• Stay away from sick people
• Get flu vaccine annually
• Maintain healthy diet and exercise

When to see a doctor:
• Symptoms worsen or persist beyond 10 days
• Difficulty breathing or chest pain
• Persistent high fever
• Confusion or severe fatigue
• Colored sputum or hemoptysis (coughing blood)`;
    }
    
    if (lowerMessage.includes('heart attack') || lowerMessage.includes('cardiac') || lowerMessage.includes('myocardial')) {
      return `HEART ATTACK SYMPTOMS - EMERGENCY WARNING

⚠️ IMMEDIATE ACTION REQUIRED ⚠️

If you or someone else is experiencing these symptoms, CALL EMERGENCY SERVICES (911/999/112) IMMEDIATELY!

Main Symptoms of Heart Attack:

Chest Pain/Discomfort:
• Sudden pressure or squeezing in the chest
• Pain that radiates to arm, neck, jaw, or back
• Described as heaviness, tightness, or burning
• Can last for several minutes or come and go
• May feel like severe indigestion

Other Critical Symptoms:
• Shortness of breath (with or without chest pain)
• Cold sweats
• Nausea or vomiting
• Lightheadedness or dizziness
• Extreme fatigue or weakness
• Anxiety or sense of doom
• Irregular heartbeat or palpitations

Important Notes:

Women may experience:
• Unusual fatigue
• Shortness of breath without chest pain
• Pain in upper back, shoulders, or jaw
• Mild chest discomfort
• Symptoms may be more subtle

Elderly or Diabetic Patients:
• May have "silent" heart attacks with minimal symptoms
• Extra caution needed with any chest discomfort

What to Do:

IMMEDIATE (Call Emergency):
• Stop any activity immediately
• Sit down and rest
• Call emergency services right away
• Don't drive yourself
• Chew aspirin if available (unless allergic)
• Provide your location clearly
• Stay calm and try to relax

While Waiting for Help:
• Loosen tight clothing
• Have someone stay with you
• Keep emergency contacts ready
• Note exact time symptoms started

Risk Factors for Heart Attack:
• High blood pressure
• High cholesterol
• Smoking
• Diabetes
• Family history of heart disease
• Age (men >45, women >55)
• Obesity
• Physical inactivity
• Stress
• Recent trauma or surgery

Recovery & Prevention:

After a Heart Attack:
• Follow all medical advice closely
• Take prescribed medications regularly
• Attend cardiac rehabilitation
• Modify lifestyle
• Regular follow-up with cardiologist
• Manage stress levels
• Gradual return to activities

Prevention:
• Regular exercise (150 min/week)
• Heart-healthy diet (low sodium, low fat)
• Maintain healthy weight
• Don't smoke
• Manage stress and emotions
• Control blood pressure and cholesterol
• Regular health checkups
• Limit alcohol consumption
• Get adequate sleep

⚠️ DISCLAIMER: This is educational information only. If you suspect a heart attack, DO NOT delay - seek emergency medical care immediately. Time is critical in heart attack treatment.`;
    }
    
    if (lowerMessage.includes('pain') || lowerMessage.includes('ache')) {
      return `PAIN MANAGEMENT

Types and Treatment:

Acute Pain (sudden, new):
• Apply ice for first 48 hours
• Rest and elevate if possible
• Take over-the-counter pain relievers
• Use compression bandages if applicable

Chronic Pain (ongoing):
• Apply heat for stiffness and muscle tension
• Gentle stretching and movement
• Regular exercise (as tolerated)
• Physical therapy
• Stress management

General Pain Relief:
• Over-the-counter options: Paracetamol or Ibuprofen
• Apply hot/cold therapy as appropriate
• Massage or gentle stretching
• Adequate rest between activities
• Relaxation techniques

When to see a doctor:
• Pain is severe or disabling
• Pain persists for more than 3 weeks
• Pain follows an injury
• Pain worsens despite treatment
• Pain is accompanied by other symptoms
• Pain affects daily activities`;
    }
    
    if (lowerMessage.includes('diabetes') || lowerMessage.includes('blood sugar') || lowerMessage.includes('glucose')) {
      return `DIABETES MANAGEMENT

What is Diabetes?
Diabetes is a condition where blood sugar levels are too high due to insufficient insulin production or use.

Types of Diabetes:

Type 1 Diabetes:
• Body doesn't produce insulin
• Usually develops in childhood/young adults
• Requires insulin injections
• Accounts for 5-10% of diabetes cases

Type 2 Diabetes:
• Body doesn't use insulin effectively
• Usually develops later in life
• Related to weight and lifestyle
• Most common type (90-95% of cases)

Symptoms of Diabetes:
• Increased thirst
• Frequent urination
• Extreme fatigue
• Blurred vision
• Slow-healing cuts or sores
• Tingling in hands or feet
• Unusual weight loss or gain
• Increased hunger

Diabetes Management:

Daily Care:
• Monitor blood sugar levels regularly
• Take medications as prescribed
• Follow a balanced diet low in sugar
• Exercise regularly (150 min/week)
• Maintain healthy weight
• Stay hydrated
• Get adequate sleep
• Manage stress

Diet Recommendations:
• Complex carbohydrates (whole grains, vegetables)
• Lean proteins (chicken, fish, beans)
• Healthy fats (olive oil, nuts)
• Limit sugar and processed foods
• Eat regular meals
• Control portion sizes

Exercise:
• Aerobic activity: Walking, swimming, cycling
• Strength training: 2-3 times per week
• Flexibility work: Yoga, stretching
• Start slowly and increase gradually

Complications to Avoid:
• Heart disease
• Kidney disease
• Eye problems (retinopathy)
• Nerve damage (neuropathy)
• Foot problems
• Stroke

Prevention (for Type 2):
• Maintain healthy weight
• Regular exercise
• Healthy eating habits
• Limit alcohol
• Don't smoke
• Regular health checkups
• Manage stress
• Adequate sleep

When to See a Doctor:
• Symptoms of diabetes appear
• Blood sugar not controlled
• Numbness or tingling in feet
• Vision changes
• Slow-healing wounds
• Regular diabetes checkups (annually or as advised)`;
    }
    
    if (lowerMessage.includes('asthma') || lowerMessage.includes('wheeze') || lowerMessage.includes('breathing')) {
      return `ASTHMA MANAGEMENT

What is Asthma?
Asthma is a chronic lung condition that causes airways to narrow, making breathing difficult.

Symptoms of Asthma:
• Shortness of breath
• Chest pain or tightness
• Wheezing (whistling sound when breathing)
• Coughing (especially at night or during play)
• Difficulty exercising
• Fatigue or weakness
• Difficulty sleeping due to breathing issues

Asthma Triggers:
• Allergens (pollen, dust, pet dander)
• Air pollution
• Cold air or weather changes
• Exercise
• Infections (colds, flu)
• Stress or strong emotions
• Smoke or air pollutants
• Certain medications (aspirin, NSAIDs)

Daily Management:

Preventive Steps:
• Take controller medications daily as prescribed
• Keep rescue inhaler nearby
• Identify and avoid personal triggers
• Maintain clean home environment
• Regular exercise (builds lung capacity)
• Manage stress
• Get adequate sleep
• Stay hydrated

Using an Inhaler:
1. Shake the inhaler well
2. Breathe out completely
3. Place lips around mouthpiece
4. Press down while inhaling
5. Hold breath for 10 seconds
6. Exhale slowly

When to Use Rescue Inhaler:
• Sudden shortness of breath
• Wheezing
• Chest tightness
• During asthma attack

Emergency Signs - Seek Help If:
• Difficulty speaking or walking
• Blue lips or face
• Severe wheezing with no relief
• Peak flow measurement very low
• No improvement after using rescue inhaler

Lifestyle Modifications:
• Exercise regularly (swimming is excellent)
• Keep indoor air clean (use air filters)
• Avoid smoking and secondhand smoke
• Use air conditioning in high pollen seasons
• Sleep with head elevated
• Maintain healthy weight
• Manage allergies
• Regular doctor checkups

Medications:
• Controller inhalers (daily prevention)
• Rescue inhalers (emergency relief)
• Oral medications if needed
• Always follow doctor's prescription

Foods That May Help:
• Omega-3 rich foods (fish, flaxseed)
• Antioxidant-rich foods (berries, vegetables)
• Avoid processed foods high in additives`;
    }
    
    if (lowerMessage.includes('blood pressure') || lowerMessage.includes('hypertension') || lowerMessage.includes('hypotension')) {
      return `BLOOD PRESSURE MANAGEMENT

What is Blood Pressure?
Two numbers: Systolic (top) / Diastolic (bottom) - measured in mmHg

Blood Pressure Categories:

Normal:
• Less than 120/80 mmHg

Elevated:
• Systolic 120-129 and Diastolic less than 80

High Blood Pressure (Hypertension):
• Stage 1: 130-139 / 80-89
• Stage 2: 140+ / 90+
• Hypertensive Crisis: 180+ / 120+ (seek immediate help)

Low Blood Pressure (Hypotension):
• Below 90/60 mmHg
• May cause dizziness, fainting

Symptoms of High Blood Pressure:
• Often no symptoms (silent killer)
• Headaches
• Shortness of breath
• Nosebleeds
• Chest pain

Symptoms of Low Blood Pressure:
• Dizziness or lightheadedness
• Fainting
• Blurred vision
• Nausea
• Fatigue
• Difficulty concentrating

High Blood Pressure Management:

Lifestyle Changes:
• Reduce salt intake (less than 2,300 mg daily)
• Follow DASH diet (fruits, vegetables, whole grains)
• Exercise regularly (150 min/week)
• Maintain healthy weight
• Limit alcohol consumption
• Don't smoke
• Manage stress
• Get 7-9 hours sleep
• Limit caffeine

Foods to Eat:
• Leafy greens (spinach, kale)
• Berries (blueberries, strawberries)
• Fish and omega-3 sources
• Whole grains
• Low-fat dairy
• Legumes and beans
• Garlic and herbs (for flavor, not salt)

Foods to Avoid:
• High-sodium processed foods
• Canned soups
• Deli meats
• Frozen dinners
• Salty snacks
• High-fat dairy
• Excess sugar

Medications:
• ACE inhibitors
• Beta-blockers
• Calcium channel blockers
• Diuretics
• Take as prescribed

Monitoring:
• Check regularly at home or pharmacy
• Keep a log of readings
• Discuss trends with doctor
• Check both arms

When to Seek Help:
• Blood pressure consistently high
• Sudden severe headache with BP spike
• Chest pain or shortness of breath
• Vision changes`;
    }
    
    if (lowerMessage.includes('cholesterol') || lowerMessage.includes('lipid')) {
      return `CHOLESTEROL MANAGEMENT

What is Cholesterol?
Cholesterol is a fat-like substance in blood needed for healthy cells but excess can increase disease risk.

Types of Cholesterol:

LDL (Low-Density Lipoprotein):
• "Bad" cholesterol
• Builds up in arteries
• Goal: Less than 100 mg/dL

HDL (High-Density Lipoprotein):
• "Good" cholesterol
• Removes bad cholesterol
• Goal: 60 mg/dL or higher

Triglycerides:
• Another type of blood fat
• Goal: Less than 150 mg/dL

Total Cholesterol:
• Sum of all cholesterol
• Goal: Less than 200 mg/dL

Cholesterol Levels:

Desirable:
• Total: Less than 200 mg/dL
• LDL: Less than 100 mg/dL
• HDL: 60 mg/dL or higher
• Triglycerides: Less than 150 mg/dL

Borderline High:
• Total: 200-239 mg/dL
• LDL: 100-129 mg/dL

High:
• Total: 240 mg/dL or higher
• LDL: 130 mg/dL or higher

Risk Factors for High Cholesterol:
• Family history
• Unhealthy diet (high saturated fat)
• Physical inactivity
• Obesity
• Smoking
• Age (men >45, women >55)
• Diabetes
• Stress

Lowering Cholesterol:

Diet Changes:
• Reduce saturated fats (butter, fatty meats)
• Choose lean proteins (chicken, fish)
• Eat soluble fiber (oats, beans, apples)
• Increase fruits and vegetables
• Choose whole grains
• Use olive oil instead of butter
• Eat fatty fish 2-3 times weekly
• Limit trans fats
• Reduce sugar and processed foods

Exercise:
• 150 minutes moderate activity weekly
• Strength training 2-3 times weekly
• Any physical activity helps

Lifestyle:
• Quit smoking
• Limit alcohol
• Maintain healthy weight
• Manage stress
• Get adequate sleep

Medications (if needed):
• Statins (most common)
• Other cholesterol-lowering drugs
• Take as prescribed by doctor

Monitoring:
• Get cholesterol checked every 4-6 years
• More frequently if taking medications
• Keep records of your levels

Foods That Help:
• Oatmeal and whole grains
• Nuts and seeds
• Fatty fish (salmon, mackerel)
• Olive oil
• Berries
• Beans and legumes
• Dark chocolate (in moderation)
• Green tea`;
    }
    
    if (lowerMessage.includes('insomnia') || lowerMessage.includes('sleep') || lowerMessage.includes('sleepless')) {
      return `SLEEP & INSOMNIA MANAGEMENT

What is Insomnia?
Difficulty falling asleep, staying asleep, or waking too early and not being able to fall back asleep.

Types of Insomnia:

Acute Insomnia:
• Lasts a few nights to weeks
• Usually caused by stress or life events
• Often resolves on its own

Chronic Insomnia:
• Occurs 3+ nights per week for 3+ months
• May require medical treatment

Symptoms:
• Difficulty falling asleep
• Waking frequently during night
• Waking too early
• Daytime fatigue
• Difficulty concentrating
• Mood disturbances
• Low performance at work/school

Causes:
• Stress or anxiety
• Depression
• Chronic pain
• Caffeine, alcohol, or nicotine
• Irregular sleep schedule
• Screen time before bed
• Uncomfortable sleep environment
• Medical conditions
• Medications

Sleep Hygiene Tips:

Bedroom Environment:
• Dark and cool (60-67°F / 15-19°C)
• Quiet (use earplugs if needed)
• Comfortable mattress and pillows
• Remove electronics
• Dedicated sleep space only

Before Bedtime:
• Go to bed at same time daily
• Wake up at same time daily
• Avoid screens 1 hour before bed
• Avoid large meals 2-3 hours before bed
• Try relaxing activities (reading, meditation)
• Take a warm bath
• Practice deep breathing

Lifestyle Changes:
• Exercise daily (not near bedtime)
• Limit caffeine (especially after 2 PM)
• Avoid alcohol before bed
• Don't smoke
• Reduce stress (yoga, meditation)
• Get natural sunlight exposure
• Avoid long naps

Relaxation Techniques:
• Deep breathing exercises
• Progressive muscle relaxation
• Meditation
• Guided imagery
• Journaling thoughts before bed
• Counting backwards

Foods That Help Sleep:
• Warm milk
• Chamomile tea
• Almonds
• Kiwi fruit
• Salmon (omega-3s)
• Whole grain bread
• Banana

Foods to Avoid Before Sleep:
• Caffeine
• Heavy, fatty foods
• Alcohol
• Spicy foods
• Large amounts of sugar

When to See a Doctor:
• Insomnia lasts more than a few weeks
• Affects daily functioning
• Other symptoms present
• Snoring loudly (sleep apnea)
• Daytime sleepiness despite sleep`;
    }
    
    if (lowerMessage.includes('stress') || lowerMessage.includes('anxiety') || lowerMessage.includes('depression')) {
      return `STRESS, ANXIETY & MENTAL HEALTH MANAGEMENT

What is Stress?
A physical and emotional response to challenging situations.

Types:

Acute Stress:
• Short-term response to immediate threat
• Resolves when stressor is gone
• Normal and sometimes helpful

Chronic Stress:
• Ongoing stress from life circumstances
• Can lead to health problems
• Requires management

Symptoms of Stress:

Physical:
• Headaches
• Muscle tension
• Fatigue
• Sleep problems
• Stomach issues
• Chest pain
• Weakened immunity

Emotional:
• Anxiety
• Irritability
• Depression
• Overwhelm
• Difficulty concentrating
• Memory problems

Anxiety Symptoms:
• Excessive worry
• Restlessness
• Rapid heartbeat
• Shortness of breath
• Panic or fear
• Difficulty sleeping
• Muscle tension

Depression Symptoms:
• Persistent sadness
• Loss of interest in activities
• Hopelessness
• Sleep changes
• Appetite changes
• Fatigue
• Difficulty concentrating
• Thoughts of self-harm

Stress Management Techniques:

Physical Activities:
• Regular exercise (30 min, 5 days/week)
• Walking or jogging
• Swimming
• Yoga
• Tai chi
• Dancing
• Sports

Relaxation Methods:
• Deep breathing exercises
• Progressive muscle relaxation
• Meditation
• Mindfulness practice
• Guided imagery
• Journaling
• Art or creative hobbies

Lifestyle Changes:
• Regular sleep schedule
• Balanced, healthy diet
• Limit caffeine and alcohol
• Social connection
• Time in nature
• Set boundaries
• Organize and prioritize
• Take breaks

Quick Stress Relief:
• Take 5 deep breaths
• Take a short walk
• Listen to calming music
• Drink water
• Stretch
• Step outside
• Talk to someone
• Take a warm shower

When to Seek Professional Help:

See a Doctor If:
• Stress affects daily functioning
• Anxiety or depression lasts more than 2 weeks
• Thoughts of self-harm or suicide
• Unable to work or study
• Substance use to cope
• Physical symptoms persist
• Sleep significantly disrupted

Treatment Options:
• Psychotherapy/counseling
• Cognitive behavioral therapy (CBT)
• Medications (if recommended)
• Support groups
• Meditation programs
• Stress management classes

Emergency:
• Call emergency services if experiencing suicidal thoughts
• Crisis hotlines available 24/7
• Don't be afraid to reach out`;
    }
    
    if (lowerMessage.includes('migraine') || lowerMessage.includes('severe headache')) {
      return `MIGRAINE MANAGEMENT

What is a Migraine?
A neurological condition causing severe headaches, often with other symptoms.

Migraine vs Headache:

Migraine:
• Severe, pulsating pain
• Usually one-sided
• Lasts 4-72 hours
• Often worse with activity
• May include nausea/vomiting

Tension Headache:
• Mild to moderate pressure
• Both sides of head
• Last 30 minutes to several hours
• Usually not disabling

Migraine Symptoms:

Before Migraine (Prodrome):
• Mood changes
• Food cravings
• Energy changes
• Sleep disturbances

Aura (before headache):
• Flashing lights
• Blind spots
• Tingling in face/limbs
• Difficulty speaking
• Usually lasts 20-60 minutes

During Migraine:
• Severe throbbing pain
• Nausea and vomiting
• Sensitivity to light
• Sensitivity to sound
• Sensitivity to smell
• Fatigue

Migraine Triggers:

Common Triggers:
• Hormonal changes
• Stress and anxiety
• Sleep changes
• Skipped meals
• Caffeine (too much or withdrawal)
• Alcohol
• Weather changes
• Bright lights
• Loud noises
• Strong smells
• Certain foods

Migraine Triggers to Avoid:
• Aged cheeses
• Processed meats
• Chocolate
• Red wine
• Caffeine
• MSG (monosodium glutamate)
• Aspartame

Migraine Management:

Prevention:
• Identify and avoid triggers
• Maintain regular sleep schedule
• Manage stress
• Regular exercise
• Stay hydrated
• Eat regular meals
• Limit caffeine
• Limit alcohol
• Keep a migraine diary

During a Migraine:

Immediate Relief:
• Take medication early (if prescribed)
• Rest in dark, quiet room
• Apply cold or warm compress
• Stay hydrated
• Avoid strong smells
• Sleep if possible
• Over-the-counter pain relievers (if approved)

Medications:
• Acute medications (for active migraine)
• Preventive medications (daily, to reduce frequency)
• Always take as prescribed

Lifestyle Tips:
• Keep regular sleep routine
• Exercise regularly (but not during migraine)
• Yoga and stretching
• Meditation and relaxation
• Stress management
• Balanced diet

When to See a Doctor:
• Migraines occur frequently
• Severity is increasing
• Pattern changes
• New symptoms develop
• Over-the-counter medications don't help
• Medication side effects occur
• Daily medication use

Emergency Care If:
• Sudden worst headache of life
• Severe headache with fever, stiff neck
• Headache with confusion or vision loss
• Headache after head injury
• Severe headache in elderly (unusual)`;
    }
    
    if (lowerMessage.includes('allerg') || lowerMessage.includes('hay fever') || lowerMessage.includes('allergic')) {
      return `ALLERGIES & ALLERGY MANAGEMENT

What is an Allergy?
An immune system reaction to a substance that is harmless to most people.

Common Allergens:

Environmental:
• Pollen (trees, grasses, weeds)
• Dust mites
• Mold
• Pet dander
• Latex

Food:
• Peanuts and tree nuts
• Shellfish
• Fish
• Milk
• Eggs
• Soy
• Wheat

Medication:
• Penicillin
• Sulfonamides
• Aspirin

Other:
• Insect stings
• Bee venom

Allergy Symptoms:

Mild to Moderate:
• Sneezing
• Runny or stuffy nose
• Itchy, watery eyes
• Itchy nose or throat
• Hives or skin rash
• Mild swelling

Severe (Anaphylaxis - Emergency):
• Severe swelling (face, throat, tongue)
• Difficulty breathing
• Dizziness
• Rapid heartbeat
• Severe drop in blood pressure
• Loss of consciousness

Seasonal vs Year-Round:

Seasonal Allergies:
• Spring: Tree pollen
• Summer: Grass pollen
• Fall: Weed pollen
• Winter: Minimal outdoor allergens

Year-Round (Perennial):
• Dust mites
• Pet dander
• Mold
• Indoor allergens

Allergy Management:

Avoidance Strategies:
• Keep windows closed during high pollen
• Use air conditioning with filters
• Wash hands and face after outdoor time
• Change clothes after being outside
• Shower before bed
• Keep bedroom door closed
• Use mattress and pillow covers
• Remove shoes before entering home
• Vacuum regularly
• Keep pets out of bedroom

Environmental Control:
• Use HEPA air filters
• Dehumidify to reduce mold and dust mites
• Regular cleaning (damp cloth, not dry)
• Maintain temperature 60-75°F
• Keep humidity 30-50%
• Use dust-proof storage containers

Medications:

Over-the-Counter:
• Antihistamines (oral or nasal spray)
• Decongestants
• Combination products
• Take as directed

Prescription:
• Stronger antihistamines
• Nasal corticosteroid sprays
• Leukotriene inhibitors
• Immunotherapy (allergy shots or tablets)

Natural Remedies:
• Saline nasal rinse
• Honey (may help with pollen allergies)
• Quercetin (in fruits/vegetables)
• Steam inhalation

Food Allergy Management:
• Read all food labels
• Inform restaurants of allergies
• Carry epinephrine auto-injector if severe
• Avoid cross-contamination
• Know alternative foods

When to See a Doctor:
• Symptoms severe or persistent
• Symptoms affect daily life
• Over-the-counter medications don't help
• Concerned about specific allergen
• Need allergy testing
• Considering immunotherapy

Emergency (Call 911):
• Difficulty breathing
• Throat or tongue swelling
• Severe dizziness
• Severe allergic reaction symptoms
• Anaphylaxis`;
    }
    
    if (lowerMessage.includes('healthy diet') || lowerMessage.includes('nutrition') || lowerMessage.includes('diet recommendations')) {
      return `HEALTHY DIET RECOMMENDATIONS

What is a Healthy Diet?
A balanced diet with proper nutrients to maintain health, energy, and prevent diseases.

Macronutrients Balance:

Carbohydrates (45-65% of calories):
• Complex carbs: Whole grains, oats, brown rice
• Fruits and vegetables
• Legumes and beans
• Avoid: Refined sugars, white bread, pastries

Proteins (10-35% of calories):
• Lean meats: Chicken, turkey
• Fish: Salmon, mackerel (omega-3)
• Eggs
• Legumes: Beans, lentils
• Nuts and seeds
• Low-fat dairy

Fats (20-35% of calories):
• Healthy fats: Olive oil, avocado, nuts
• Omega-3: Fish, flaxseed, chia seeds
• Limit: Saturated fats, trans fats
• Avoid: Fried foods, processed oils

Micronutrients - Key Vitamins & Minerals:

Vitamins:
• Vitamin A: Carrots, sweet potatoes, spinach (eye health)
• Vitamin C: Citrus, berries, broccoli (immunity)
• Vitamin D: Fatty fish, egg yolks, sunlight (bone health)
• Vitamin B: Whole grains, meat, legumes (energy)
• Vitamin E: Nuts, seeds, vegetable oils (antioxidant)

Minerals:
• Calcium: Dairy, leafy greens, fortified foods (bones)
• Iron: Red meat, beans, spinach (energy transport)
• Potassium: Bananas, potatoes, legumes (heart health)
• Magnesium: Seeds, nuts, whole grains (muscle function)
• Zinc: Meat, shellfish, legumes (immunity)

Foods to Eat Daily:

Vegetables (5+ servings):
• Dark leafy greens: Spinach, kale, broccoli
• Colorful varieties: Red peppers, carrots, tomatoes
• Root vegetables: Beets, sweet potatoes
• Cruciferous: Cauliflower, Brussels sprouts
• Aim for variety and color

Fruits (2-3 servings):
• Berries: Blueberries, strawberries (antioxidants)
• Citrus: Oranges, lemons (vitamin C)
• Apples, pears, bananas (fiber)
• Avocado (healthy fats)
• Whole fruit over juice

Whole Grains (3+ servings):
• Brown rice
• Whole wheat bread
• Oatmeal
• Quinoa
• Barley
• Limit refined grains

Proteins (2-3 servings):
• Lean meats: 3-4 oz serving
• Fish 2-3 times weekly
• Plant-based options daily
• Eggs 2-3 times weekly
• Beans and legumes daily

Dairy (2-3 servings):
• Low-fat or fat-free milk
• Yogurt (plain, not sugary)
• Cheese in moderation
• Fortified alternatives if lactose intolerant

Healthy Fats:
• Olive oil (cooking and salads)
• Nuts and seeds as snacks
• Avocado on toast
• Fatty fish weekly
• Limit butter and full-fat dairy

Foods to Limit or Avoid:

Added Sugars:
• Sodas and sweetened drinks
• Candy and desserts
• Sugary cereals
• Flavored yogurt
• Baked goods
• Limit to <25g/day for women, <36g/day for men

Sodium (Salt):
• Processed foods
• Canned soups
• Deli meats
• Fast food
• Salty snacks
• Limit to <2,300 mg/day

Trans Fats:
• Fried foods
• Processed snacks
• Baked goods with shortening
• Margarine with trans fats
• Read labels for "partially hydrogenated"

Saturated Fats:
• Fatty meats
• Full-fat dairy
• Coconut oil
• Butter (use sparingly)

Alcohol:
• Limit to moderate amounts
• Women: Up to 1 drink/day
• Men: Up to 2 drinks/day

Meal Planning Tips:

Breakfast Ideas:
• Oatmeal with berries and nuts
• Whole grain toast with avocado
• Eggs with vegetables
• Yogurt with granola
• Smoothie with fruit and protein

Lunch Ideas:
• Grilled chicken with vegetables
• Salmon salad
• Veggie and bean burrito
• Turkey sandwich on whole grain
• Lentil soup

Dinner Ideas:
• Grilled fish with brown rice and broccoli
• Lean beef with sweet potato and greens
• Pasta with tomato sauce and vegetables
• Stir-fry with vegetables and tofu
• Roasted chicken with roasted vegetables

Snack Ideas:
• Apple with almond butter
• Mixed nuts
• Yogurt
• Carrot sticks with hummus
• String cheese
• Berries

Hydration:
• Drink 8-10 glasses of water daily
• More if exercising or hot weather
• Limit sugary drinks
• Herbal tea is beneficial
• Coffee in moderation

Healthy Eating Habits:

Portion Control:
• Use smaller plates
• Fill half plate with vegetables
• Quarter plate protein
• Quarter plate grains
• Read nutrition labels

Meal Prep:
• Prepare meals in advance
• Portion and store correctly
• Reduces unhealthy choices
• Saves time during week

Eating Patterns:
• Eat at regular times
• Don't skip breakfast
• Listen to hunger cues
• Stop when satisfied
• Eat slowly

Dining Out Tips:
• Check menu beforehand
• Ask for dressings on side
• Choose grilled over fried
• Request modifications
• Watch portion sizes
• Limit alcohol

Special Diets:

Mediterranean Diet:
• Emphasis on fruits, vegetables, whole grains
• Olive oil as main fat
• Fish 2-3 times weekly
• Limited red meat
• Moderate wine with meals

DASH Diet (for blood pressure):
• Fruits and vegetables
• Whole grains
• Lean proteins
• Low-fat dairy
• Limited salt and sugar

Vegetarian/Vegan:
• Complete proteins: Beans, nuts, seeds
• B12 supplementation may be needed
• Variety of plant-based foods
• Include iron-rich foods with vitamin C

When to Seek Advice:
• Weight concerns
• Allergies or intolerances
• Medical conditions (diabetes, heart disease)
• Medication interactions with foods
• Difficulty maintaining healthy diet`;
    }
    
    if (lowerMessage.includes('when should i see a doctor') || lowerMessage.includes('should i see doctor') || lowerMessage.includes('go to doctor')) {
      return `WHEN TO SEE A DOCTOR

Routine Check-ups:

Age-Based Screening:

Adults 18-39:
• Every 1-3 years for general checkup
• More frequently if chronic conditions
• Before starting new fitness program
• Annual dental checkup
• Eye exam every 1-2 years

Adults 40-49:
• Annual physical exam
• Blood pressure check
• Cholesterol screening every 4-6 years
• Diabetes screening
• Cancer screenings as recommended

Adults 50+:
• Annual physical exam
• Blood pressure check
• Cholesterol screening annually
• Diabetes screening
• Colorectal cancer screening
• Prostate cancer screening (men)
• Mammogram (women)
• Bone density screening

When to Make an Appointment:

Cold/Flu Symptoms:
• Symptoms lasting more than 10 days
• High fever (>101.5°F) lasting >3 days
• Severe cough or difficulty breathing
• Blood in sputum
• Severe body aches
• Signs of secondary infection

Fever:
• Fever >103°F in adults
• Fever lasting >3-5 days
• Fever with severe symptoms
• Fever with rash
• Fever with stiff neck or confusion

Headaches:
• Severe, sudden onset
• Different from usual pattern
• Accompanied by fever/confusion
• With vision changes
• Following head injury
• Persistent despite medication

Pain:
• Severe or disabling pain
• Chest pain or pressure
• Abdominal pain lasting >24 hours
• Pain following injury
• Pain worsening over time
• Pain affecting daily activities

Digestive Issues:
• Nausea/vomiting lasting >24 hours
• Diarrhea lasting >2 days
• Constipation lasting >1 week
• Blood in stool
• Severe abdominal pain
• Difficulty swallowing

Respiratory Issues:
• Shortness of breath at rest
• Difficulty breathing during normal activity
• Persistent cough lasting >2 weeks
• Coughing up blood
• Wheezing
• Chest pain with breathing

Mental Health:
• Persistent sadness lasting >2 weeks
• Thoughts of self-harm
• Severe anxiety affecting daily life
• Unusual behavioral changes
• Sleep problems lasting weeks
• Loss of interest in activities

Skin Issues:
• New moles or changes in existing moles
• Wound not healing after 2 weeks
• Signs of infection (redness, warmth, pus)
• Severe or spreading rash
• Itching lasting >2 weeks
• Skin lesions causing pain

Ear/Nose/Throat:
• Ear pain with hearing loss
• Persistent sore throat
• Difficulty swallowing
• Hoarseness lasting >2 weeks
• Sinus pain lasting >10 days

Eyes/Vision:
• Sudden vision loss
• Severe eye pain
• Flashing lights or new floaters
• Double vision
• Eye redness with discharge
• Difficulty seeing at night

Women's Health:
• Unusual vaginal discharge
• Pelvic pain
• Abnormal menstrual bleeding
• Pregnancy-related symptoms
• Contraception questions

Men's Health:
• Erectile dysfunction
• Urinary problems
• Testicular pain or swelling
• Prostate concerns

Urgent Care Situations:

Seek Urgent Care (ER or Urgent Clinic) For:
• Chest pain or pressure
• Difficulty breathing
• Sudden severe headache
• Slurred speech or weakness
• Severe abdominal pain
• Vomiting blood
• Signs of stroke
• Severe allergic reaction
• Major injuries
• Uncontrolled bleeding
• Possible broken bones
• Severe burns
• Poisoning or overdose
• Loss of consciousness
• Severe eye trauma
• Choking

Preventive Health Visits:

Annual Physical Should Include:
• Weight and height measurement
• Blood pressure check
• Heart and lung examination
• Abdominal examination
• Blood work (as recommended)
• Discussion of health concerns
• Vaccination review
• Cancer screening discussion

Chronic Disease Management:
• Diabetes: Every 3 months with adjustments, annually otherwise
• Heart disease: Every 1-3 months
• High blood pressure: Every 1-3 months initially
• Asthma: Every 3 months or as needed
• Depression/anxiety: Monthly or as recommended

Medication Reviews:
• If taking multiple medications
• If experiencing side effects
• When starting new medications
• After dose changes
• If considering stopping medication

Specific Reasons for Doctor Visit:

Before Starting Exercise:
• If over 40
• If sedentary for long time
• With chronic conditions
• If family history of heart disease

Vaccinations:
• Annual flu shot
• COVID-19 boosters
• Other recommended vaccines
• Travel vaccinations

Sexual Health:
• STI screening
• Contraception options
• Sexual dysfunction
• Fertility concerns

Lifestyle/Wellness:
• Weight management help
• Smoking cessation
• Nutrition counseling
• Stress management
• Sleep problems

Specialist Referrals:
• Cardiologist: Heart concerns
• Dermatologist: Skin issues
• Orthopedist: Bone/joint problems
• Neurologist: Headaches/neurological issues
• Psychiatrist: Mental health issues
• Physical therapist: Injury rehabilitation

When NOT to Wait:

EMERGENCY - Call 911:
• Chest pain or pressure
• Difficulty breathing
• Uncontrolled bleeding
• Severe abdominal pain
• Sudden severe headache
• Slurred speech or facial drooping
• Arm or leg weakness
• Confusion or difficulty speaking
• Choking
• Severe allergic reaction
• Poisoning
• Severe trauma
• Suicidal thoughts`;
    }
    
    if (lowerMessage.includes('blood pressure reading') || lowerMessage.includes('explain blood pressure') || lowerMessage.includes('blood pressure numbers')) {
      return `UNDERSTANDING BLOOD PRESSURE READINGS

What Do Blood Pressure Numbers Mean?

Blood Pressure Format:
Systolic/Diastolic (e.g., 120/80)
Measured in millimeters of mercury (mmHg)

Systolic (Top Number):
• Pressure when heart pumps blood out
• Force on arteries during heartbeat
• Higher of the two numbers
• Reflects heart's strength

Diastolic (Bottom Number):
• Pressure when heart is at rest between beats
• Force on arteries while resting
• Lower of the two numbers
• Reflects artery resistance

Blood Pressure Categories:

NORMAL:
• Less than 120/80 mmHg
• Optimal for health
• Continue healthy habits
• Recheck regularly

ELEVATED:
• Systolic 120-129 AND Diastolic less than 80
• Increased risk of high blood pressure
• Lifestyle changes recommended
• Monitor regularly

HIGH BLOOD PRESSURE (HYPERTENSION):

Stage 1:
• Systolic 130-139 OR Diastolic 80-89
• Medical attention recommended
• Lifestyle changes important
• May need medication

Stage 2:
• Systolic 140 or higher OR Diastolic 90 or higher
• Significant health risk
• Medication likely needed
• See doctor promptly

Hypertensive Crisis (Emergency):
• Systolic higher than 180 AND/OR Diastolic higher than 120
• Seek emergency medical care immediately
• Risk of organ damage
• Do not wait

LOW BLOOD PRESSURE (HYPOTENSION):

Normal Low:
• 90/60 or lower
• May be normal for athletic individuals
• Monitor symptoms

Symptomatic Hypotension:
• Causes dizziness, fainting, confusion
• Requires medical evaluation
• May need treatment

Example Readings & Meaning:

Example 1: 115/75 mmHg
• Status: NORMAL
• Action: Maintain current habits
• Recheck: Every 1-2 years

Example 2: 125/80 mmHg
• Status: ELEVATED
• Action: Lifestyle changes
• Recheck: Every 3-6 months

Example 3: 135/85 mmHg
• Status: STAGE 1 HYPERTENSION
• Action: Lifestyle changes, see doctor
• Recheck: Every 1-2 months

Example 4: 145/92 mmHg
• Status: STAGE 2 HYPERTENSION
• Action: See doctor, may need medication
• Recheck: Frequently

Example 5: 190/120 mmHg
• Status: HYPERTENSIVE CRISIS
• Action: SEEK EMERGENCY CARE NOW
• Call 911 if symptoms present

Factors Affecting Blood Pressure:

Temporary Increases:
• Caffeine consumption
• Exercise
• Stress or anxiety
• Cold weather
• Full bladder
• Recent meal
• Talking

These are normal variations - take reading at rest

Why Multiple Readings Matter:

Single vs Multiple Readings:
• One high reading doesn't diagnose hypertension
• Need multiple readings over time
• Home monitoring helpful
• Doctor office readings important

Best Time to Check:
• Early morning before caffeine
• Sitting quietly for 5 minutes
• Same time each day for consistency
• After emptying bladder
• Not after exercise
• Relaxed state

Proper Blood Pressure Measurement:

Position:
• Sit in chair with feet flat
• Back against chair
• Arm at heart level
• Relaxed position
• No talking during measurement

Preparation:
• Avoid caffeine 30 minutes before
• Avoid exercise 30 minutes before
• Empty bladder
• Rest 5 minutes
• Consistent cuff size

Home Monitoring Tips:
• Use validated device
• Check consistency
• Record readings and time
• Keep log for doctor
• Take readings same time daily
• Usually 2 readings, 1 minute apart
• Average the readings

When BP Numbers Differ:

What if Readings Are Different?
• Normal variation occurs
• Blood pressure fluctuates throughout day
• Different cuff sizes affect reading
• Different arms may vary
• Time of day matters
• Stress level matters

Multiple Day Variation:
• Home readings usually lower
• Office readings often higher ("white coat effect")
• Pattern more important than single reading
• Discuss with doctor if concerned

Medication Effects on Blood Pressure:

How Medications Work:
• ACE inhibitors: Relax blood vessels
• Beta-blockers: Slow heart rate
• Diuretics: Reduce fluid volume
• Calcium channel blockers: Relax vessels
• Goal: Lower BP to target range

Monitoring During Treatment:
• Regular checkups important
• Dose adjustments may be needed
• Medication effectiveness varies
• Side effects discuss with doctor
• Never stop without doctor approval

Health Implications by Reading:

Normal (120/80 or less):
• Low cardiovascular risk
• Continue healthy lifestyle
• Regular checkups annually

Elevated (120-129/<80):
• Early intervention prevents progression
• Lifestyle changes key
• Regular monitoring needed
• Checkups every 3-6 months

Stage 1 HBP (130-139/80-89):
• Moderate cardiovascular risk
• Lifestyle modifications important
• May need medication
• Frequent monitoring required
• Doctor consultation essential

Stage 2 HBP (140+/90+):
• High cardiovascular risk
• Medication likely needed
• Lifestyle changes critical
• Regular doctor visits necessary
• Risk of heart attack/stroke

Hypertensive Crisis (>180/>120):
• Medical emergency
• Risk of organ damage
• Immediate medical attention needed
• Call 911 if symptoms present

Tips for Managing Blood Pressure:

Lifestyle Changes:
• Regular exercise (150 min/week)
• Reduce sodium intake
• Maintain healthy weight
• Limit alcohol
• Don't smoke
• Manage stress
• Get adequate sleep
• Eat potassium-rich foods

When to Contact Doctor:
• BP consistently high
• Symptoms of high BP (headaches, chest pain)
• Medication side effects
• BP goals not met
• New concerning symptoms
• Questions about readings`;
    }
    
    return `Thank you for your question!

For specific medical advice tailored to your situation, I recommend:

1. Consult with a healthcare professional for personalized guidance
2. If symptoms are severe or worsening, seek immediate medical attention
3. Keep track of your symptoms and when they started
4. Stay hydrated and get adequate rest
5. Monitor your body for any changes

For non-emergency medical questions, you can also:
• Contact your primary care physician
• Use telehealth services
• Visit an urgent care clinic
• Call a nurse hotline

Is there anything specific about your symptoms I can help clarify?`;
  }

  /**
   * Analyze symptoms and suggest possible conditions
   */
  async analyzeSymptoms(symptoms, age, gender, existingConditions = []) {
    try {
      const prompt = `Medical symptom analysis for:
Age: ${age}, Gender: ${gender}
Existing conditions: ${existingConditions.join(', ') || 'None'}
Symptoms: ${symptoms}

Provide analysis with possible conditions, severity, and recommendations.`;

      const response = await hf.textGeneration({
        model: this.chatModel,
        inputs: prompt,
        parameters: {
          max_new_tokens: 800,
          temperature: 0.6,
          return_full_text: false
        }
      });

      const analysisText = response.generated_text.trim();
      
      const analysis = {
        fullAnalysis: analysisText || this.getSymptomFallback(symptoms, age, gender),
        severity: this.extractSeverity(analysisText || symptoms),
        recommendedSpecialist: this.extractSpecialist(analysisText || symptoms),
        urgency: this.extractUrgency(analysisText || symptoms),
      };

      return {
        success: true,
        data: analysis,
      };
    } catch (error) {
      console.error('Symptom Analysis Error:', error);
      // Use fallback analysis
      const analysis = {
        fullAnalysis: this.getSymptomFallback(symptoms, age, gender),
        severity: this.extractSeverity(symptoms),
        recommendedSpecialist: this.extractSpecialist(symptoms),
        urgency: this.extractUrgency(symptoms),
      };
      
      return {
        success: true,
        data: analysis,
      };
    }
  }

  /**
   * Fallback symptom analysis
   */
  getSymptomFallback(symptoms, age, gender) {
    return `**Symptom Analysis**

**Patient Information:**
- Age: ${age}
- Gender: ${gender}
- Symptoms: ${symptoms}

**Initial Assessment:**
Based on the symptoms you've described, here's a general analysis:

**Possible Conditions:**
1. **Viral Infection** - Common if experiencing fever, fatigue, body aches
2. **Bacterial Infection** - If symptoms include persistent fever with localized pain
3. **Seasonal Allergies** - If symptoms include sneezing, runny nose, itchy eyes
4. **Stress-related Issues** - If experiencing headaches, fatigue, sleep problems

**Severity Assessment:**
${this.extractSeverity(symptoms)} - Based on symptom description

**Recommended Specialist:**
${this.extractSpecialist(symptoms)}

**Self-Care Recommendations:**
• Get adequate rest (7-9 hours of sleep)
• Stay well hydrated (8-10 glasses of water daily)
• Maintain a balanced diet rich in vitamins
• Monitor symptoms and track any changes
• Avoid known allergens or triggers
• Practice stress reduction techniques

**Red Flags - Seek Immediate Medical Attention If:**
• High fever (above 103°F/39.4°C) that doesn't respond to medication
• Difficulty breathing or chest pain
• Severe headache with stiff neck or confusion
• Persistent vomiting or diarrhea leading to dehydration
• Symptoms rapidly worsening
• Loss of consciousness or severe dizziness

**When to See a Doctor:**
• Symptoms persist for more than 3-5 days
• Symptoms interfere with daily activities
• You have underlying health conditions
• You're pregnant or immunocompromised
• Symptoms are unusual or concerning to you

**Important Disclaimer:**
This is a general informational analysis and NOT a medical diagnosis. Always consult with a qualified healthcare professional for proper evaluation and treatment of your specific condition.

**Next Steps:**
1. Schedule an appointment with a ${this.extractSpecialist(symptoms)}
2. Keep a symptom diary noting severity and patterns
3. Take your temperature regularly if experiencing fever
4. Follow up if symptoms change or worsen

Would you like to book an appointment with a doctor?`;
  }

  /**
   * Get doctor recommendations based on symptoms
   */
  async recommendDoctor(symptoms, medicalHistory = '') {
    try {
      const prompt = `Based on the following symptoms and medical history, recommend the most appropriate medical specialist:

Symptoms: ${symptoms}
Medical History: ${medicalHistory || 'None provided'}

Please recommend:
1. Primary specialist type (e.g., Cardiologist, Dermatologist, Orthopedic, etc.)
2. Alternative specialist if primary is unavailable
3. Reason for recommendation
4. Urgency level (routine/urgent/emergency)

Be specific and concise.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        success: true,
        recommendation: text,
        specialistType: this.extractSpecialist(text),
      };
    } catch (error) {
      console.error('Doctor Recommendation Error:', error);
      return {
        success: false,
        message: 'Unable to provide recommendation. Please consult a General Physician.',
        error: error.message,
      };
    }
  }

  /**
   * Explain medication or treatment
   */
  async explainMedication(medicationName) {
    try {
      const prompt = `Provide clear, patient-friendly information about the medication: ${medicationName}

Include:
1. What it is (drug class)
2. Common uses
3. How it works
4. Common side effects
5. Important precautions
6. When to contact a doctor

Keep the explanation simple and easy to understand for patients.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        success: true,
        explanation: text,
      };
    } catch (error) {
      console.error('Medication Explanation Error:', error);
      return {
        success: false,
        message: 'Unable to provide medication information. Please consult your pharmacist or doctor.',
        error: error.message,
      };
    }
  }

  /**
   * Health risk assessment
   */
  async assessHealthRisk(patientData) {
    try {
      const { age, gender, bmi, bloodPressure, existingConditions, lifestyle } = patientData;

      const prompt = `Provide a health risk assessment for a patient with the following profile:

Age: ${age}
Gender: ${gender}
BMI: ${bmi || 'Not provided'}
Blood Pressure: ${bloodPressure || 'Not provided'}
Existing Conditions: ${existingConditions?.join(', ') || 'None'}
Lifestyle factors: ${lifestyle || 'Not provided'}

Assess:
1. Overall health risk level (Low/Moderate/High)
2. Key risk factors
3. Recommended preventive measures
4. Lifestyle modifications
5. Screening tests to consider

Provide encouraging, actionable advice.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        success: true,
        assessment: text,
        riskLevel: this.extractRiskLevel(text),
      };
    } catch (error) {
      console.error('Health Risk Assessment Error:', error);
      return {
        success: false,
        message: 'Unable to complete health risk assessment.',
        error: error.message,
      };
    }
  }

  // Helper methods to extract structured data from AI responses
  extractSeverity(text) {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('severe') || lowerText.includes('serious')) return 'severe';
    if (lowerText.includes('moderate')) return 'moderate';
    return 'mild';
  }

  extractSpecialist(text) {
    const specialists = [
      'Cardiologist', 'Dermatologist', 'Neurologist', 'Orthopedic', 'Pediatrician',
      'Psychiatrist', 'General Physician', 'ENT Specialist', 'Ophthalmologist',
      'Gastroenterologist', 'Pulmonologist', 'Endocrinologist', 'Urologist',
      'Gynecologist', 'Oncologist'
    ];

    for (const specialist of specialists) {
      if (text.includes(specialist)) {
        return specialist;
      }
    }
    return 'General Physician';
  }

  extractUrgency(text) {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('emergency') || lowerText.includes('immediate')) return 'emergency';
    if (lowerText.includes('urgent') || lowerText.includes('soon')) return 'urgent';
    return 'routine';
  }

  extractRiskLevel(text) {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('high risk')) return 'high';
    if (lowerText.includes('moderate risk')) return 'moderate';
    return 'low';
  }
}

export default new AIService();
