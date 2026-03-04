// Heart Disease Prediction Controller
// Using a simple ML model prediction logic

/**
 * Calculate heart disease risk based on medical parameters
 * This uses a simplified scoring model based on known risk factors
 * For production, integrate with actual ML model
 */
const calculateHeartDiseaseRisk = (params) => {
  let riskScore = 0;

  // Age risk (increases with age)
  const age = parseFloat(params.age);
  if (age > 60) riskScore += 2;
  else if (age > 50) riskScore += 1.5;
  else if (age > 40) riskScore += 1;

  // Sex risk (males have higher risk)
  const sex = parseFloat(params.sex);
  if (sex === 1) riskScore += 1;

  // Chest pain type risk
  const cp = parseFloat(params.cp);
  if (cp === 0) riskScore += 2; // Typical angina highest risk
  else if (cp === 1) riskScore += 1.5;
  else if (cp === 2) riskScore += 0.5;

  // Blood pressure risk
  const bp = parseFloat(params.trestbps);
  if (bp > 160) riskScore += 2.5;
  else if (bp > 140) riskScore += 2;
  else if (bp > 120) riskScore += 1;

  // Cholesterol risk
  const chol = parseFloat(params.chol);
  if (chol > 240) riskScore += 2;
  else if (chol > 200) riskScore += 1.5;
  else if (chol > 160) riskScore += 0.5;

  // Fasting blood sugar
  const fbs = parseFloat(params.fbs);
  if (fbs === 1) riskScore += 1.5; // Blood sugar > 120

  // Resting ECG
  const restecg = parseFloat(params.restecg);
  if (restecg === 1 || restecg === 2) riskScore += 1.5;

  // Max heart rate (lower is worse)
  const thalach = parseFloat(params.thalach);
  if (thalach < 100) riskScore += 1.5;
  else if (thalach < 120) riskScore += 1;

  // Exercise induced angina
  const exang = parseFloat(params.exang);
  if (exang === 1) riskScore += 2;

  // ST Depression (higher is worse)
  const oldpeak = parseFloat(params.oldpeak);
  if (oldpeak > 3) riskScore += 2;
  else if (oldpeak > 1) riskScore += 1.5;
  else if (oldpeak > 0) riskScore += 0.5;

  // ST Slope
  const slope = parseFloat(params.slope);
  if (slope === 2) riskScore += 2; // Downsloping worst
  else if (slope === 1) riskScore += 1;

  // Major vessels
  const ca = parseFloat(params.ca);
  riskScore += ca * 0.5; // Each vessel adds risk

  // Thalassemia
  const thal = parseFloat(params.thal);
  if (thal === 2 || thal === 3) riskScore += 1;

  return riskScore;
};

/**
 * Predict heart disease based on input parameters
 * POST /api/heart-disease/predict
 */
export const predictHeartDisease = async (req, res) => {
  try {
    const {
      age, sex, cp, trestbps, chol, fbs, restecg, thalach,
      exang, oldpeak, slope, ca, thal
    } = req.body;

    // Validate all required fields
    const requiredFields = [
      'age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 'thalach',
      'exang', 'oldpeak', 'slope', 'ca', 'thal'
    ];

    const missingFields = requiredFields.filter(field => !(field in req.body));
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Validate numeric values
    const params = {
      age, sex, cp, trestbps, chol, fbs, restecg, thalach,
      exang, oldpeak, slope, ca, thal
    };

    for (const [key, value] of Object.entries(params)) {
      if (isNaN(value)) {
        return res.status(400).json({
          error: `Invalid value for ${key}. Must be a number.`
        });
      }
    }

    // Calculate risk score
    const riskScore = calculateHeartDiseaseRisk(params);

    // Determine prediction based on risk score (threshold at 7)
    let hasHeartDisease = riskScore >= 7;
    let prediction;
    
    if (hasHeartDisease) {
      prediction = '⚠️ The person HAS a heart disease.';
    } else {
      prediction = '✅ The person DOES NOT have a heart disease.';
    }

    // Create simple response
    const response = {
      prediction: prediction,
      hasHeartDisease: hasHeartDisease,
      riskScore: parseFloat(riskScore.toFixed(2)),
      parameters: params,
      timestamp: new Date()
    };

    return res.status(200).json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Heart disease prediction error:', error);
    return res.status(500).json({
      error: 'Prediction failed. Please try again.'
    });
  }
};

/**
 * Generate detailed analysis based on parameters
 */
const getDetailedAnalysis = (riskScore, params) => {
  let analysis = 'Key Findings:\n';
  const findings = [];

  // Analyze each parameter
  if (parseFloat(params.age) > 60) {
    findings.push('• Age above 60 is a significant risk factor');
  }

  if (parseFloat(params.trestbps) > 140) {
    findings.push('• High blood pressure detected - needs management');
  }

  if (parseFloat(params.chol) > 200) {
    findings.push('• Cholesterol level is elevated');
  }

  if (parseFloat(params.thalach) < 100) {
    findings.push('• Low maximum heart rate achieved - may indicate concern');
  }

  if (parseFloat(params.exang) === 1) {
    findings.push('• Exercise-induced angina is present');
  }

  if (parseFloat(params.oldpeak) > 1) {
    findings.push('• ST depression during exercise detected');
  }

  if (findings.length === 0) {
    findings.push('• Most parameters appear within acceptable ranges');
  }

  analysis += findings.join('\n');
  analysis += '\n\n⚕️ Recommendation: Consult with a healthcare professional for accurate diagnosis and personalized advice.';

  return analysis;
};

/**
 * Get heart disease information and tips
 * GET /api/heart-disease/info
 */
export const getHeartDiseaseInfo = async (req, res) => {
  try {
    const info = {
      title: 'Heart Disease Prevention & Management',
      riskFactors: [
        'High blood pressure (hypertension)',
        'High cholesterol levels',
        'Smoking',
        'Obesity',
        'Physical inactivity',
        'Unhealthy diet',
        'Age (men ≥45, women ≥55)',
        'Family history of heart disease',
        'Diabetes',
        'Stress and mental health'
      ],
      symptoms: [
        'Chest pain or discomfort',
        'Shortness of breath',
        'Heart palpitations',
        'Weakness or fatigue',
        'Nausea or lightheadedness',
        'Pain in arms, neck, jaw, or back'
      ],
      preventiveMeasures: [
        'Maintain healthy blood pressure (<120/80 mmHg)',
        'Keep cholesterol levels in check',
        'Exercise regularly (150 min/week moderate activity)',
        'Follow a heart-healthy diet (DASH diet)',
        'Don\'t smoke and avoid secondhand smoke',
        'Manage stress through meditation or yoga',
        'Maintain healthy weight (BMI 18.5-24.9)',
        'Limit alcohol consumption',
        'Get adequate sleep (7-9 hours)',
        'Regular health checkups'
      ]
    };

    return res.status(200).json({
      success: true,
      data: info
    });
  } catch (error) {
    console.error('Heart disease info error:', error);
    return res.status(500).json({
      error: 'Failed to retrieve information'
    });
  }
};
