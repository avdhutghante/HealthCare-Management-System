import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './BookAppointment.css';
import { doctorsWithLocation } from '../data/mockData';
import { createDemoAppointment } from '../utils/demoSync';
import realTimeSync from '../utils/realTimeSync';
import { linkAppointmentToDoctor, syncAppointmentAcrossDevices } from '../utils/appointmentLinking';

const normalizeNameKey = (name = '') => name.replace(/\s+/g, ' ').trim().toLowerCase();

const fallbackFeeByName = {
  'dr. demo': 500,
  'dr. milind gadkari': 850,
  'dr. pushkar gadre': 700,
  'dr. monika bhagat': 600,
  'dr. smita dhadge': 950,
  'dr. sanjay jain': 1100,
  'dr. yash sah': 750,
  'dr. priya kulkarni': 550,
  'dr. vikram pandit': 900,
  'dr. anil deshpande': 650
};

const mockSlotTemplate = [
  { startTime: '09:00', endTime: '09:30' },
  { startTime: '09:30', endTime: '10:00' },
  { startTime: '10:00', endTime: '10:30' },
  { startTime: '11:00', endTime: '11:30' },
  { startTime: '14:00', endTime: '14:30' },
  { startTime: '15:00', endTime: '15:30' },
  { startTime: '16:00', endTime: '16:30' }
];

const getDoctorUserId = (doctor) => {
  if (!doctor || !doctor.userId) return null;

  if (typeof doctor.userId === 'string') {
    return doctor.userId;
  }

  if (typeof doctor.userId === 'object') {
    if (typeof doctor.userId._id === 'string') {
      return doctor.userId._id;
    }

    if (typeof doctor.userId.toString === 'function') {
      return doctor.userId.toString();
    }
  }

  return null;
};

const normalizeDate = (value) => {
  const normalized = new Date(value);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

const formatTimeTo12Hour = (time24 = '') => {
  if (!time24) return '';
  const [hourStr, minuteStr = '00'] = time24.split(':');
  let hours = parseInt(hourStr, 10);
  const minutes = parseInt(minuteStr, 10) || 0;

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return time24;
  }

  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
};

const getSlotLabel = (slot) => {
  if (!slot) return '';
  if (slot.label) return slot.label;
  if (!slot.startTime) return '';

  const start = formatTimeTo12Hour(slot.startTime);
  const end = slot.endTime ? formatTimeTo12Hour(slot.endTime) : '';
  return end ? `${start} - ${end}` : start;
};

const buildMockSlots = () => mockSlotTemplate.map((slot) => ({
  ...slot,
  label: getSlotLabel(slot)
}));

const monthLookup = {
  january: 0,
  jan: 0,
  february: 1,
  feb: 1,
  march: 2,
  mar: 2,
  april: 3,
  apr: 3,
  may: 4,
  june: 5,
  jun: 5,
  july: 6,
  jul: 6,
  august: 7,
  aug: 7,
  september: 8,
  sept: 8,
  sep: 8,
  october: 9,
  oct: 9,
  november: 10,
  nov: 10,
  december: 11,
  dec: 11
};

const findDoctorBySpokenName = (speech, doctorsList) => {
  if (!speech) return null;
  const cleaned = normalizeNameKey(speech).replace(/^dr\.?\s+/, '').replace(/^doctor\s+/, '').trim();
  if (!cleaned) return null;

  let bestMatch = null;
  let bestScore = 0;

  doctorsList.forEach((candidate) => {
    const candidateName = normalizeNameKey(candidate.userId?.name || candidate.name || '');
    if (!candidateName) return;

    let score = 0;
    if (candidateName === cleaned) {
      score = 5;
    } else if (candidateName.includes(cleaned) || cleaned.includes(candidateName)) {
      score = 4;
    } else {
      const tokens = cleaned.split(' ').filter(Boolean);
      const candidateTokens = candidateName.split(' ').filter(Boolean);
      const matches = tokens.filter((token) => candidateTokens.includes(token));
      if (matches.length > 0) {
        score = matches.length;
      }
    }

    if (score > bestScore) {
      bestMatch = candidate;
      bestScore = score;
    }
  });

  return bestScore > 0 ? bestMatch : null;
};

const parseSpokenDate = (speech, referenceDate = new Date()) => {
  if (!speech) return null;
  const lower = speech.toLowerCase();
  const baseDate = normalizeDate(referenceDate);

  if (lower.includes('day after tomorrow')) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + 2);
    return date;
  }

  if (lower.includes('tomorrow')) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + 1);
    return date;
  }

  if (lower.includes('today')) {
    return baseDate;
  }

  const inDaysMatch = lower.match(/in\s+(\d{1,2})\s+days?/);
  if (inDaysMatch) {
    const offset = parseInt(inDaysMatch[1], 10);
    if (!Number.isNaN(offset)) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() + offset);
      return date;
    }
  }

  const dayMonthMatch = lower.match(/(\d{1,2})(?:st|nd|rd|th)?\s+(?:of\s+)?(january|jan|february|feb|march|mar|april|apr|may|june|jun|july|jul|august|aug|september|sept|sep|october|oct|november|nov|december|dec)(?:\s+(\d{4}))?/);
  const monthDayMatch = lower.match(/(january|jan|february|feb|march|mar|april|apr|may|june|jun|july|jul|august|aug|september|sept|sep|october|oct|november|nov|december|dec)\s+(\d{1,2})(?:st|nd|rd|th)?(?:\s+(\d{4}))?/);
  const numericMatch = lower.match(/(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/);

  const createDate = (dayValue, monthValue, yearValue) => {
    if (monthValue < 0 || monthValue > 11) return null;
    const day = Number(dayValue);
    const year = yearValue ? Number(yearValue) : baseDate.getFullYear();
    if (Number.isNaN(day) || Number.isNaN(year)) return null;

    const candidate = new Date(Date.UTC(year, monthValue, day));
    if (candidate.toString() === 'Invalid Date') return null;

    // If the interpreted date already passed this year, roll forward to next year
    const normalizedCandidate = normalizeDate(candidate);
    if (normalizedCandidate < baseDate) {
      normalizedCandidate.setFullYear(normalizedCandidate.getFullYear() + 1);
    }

    return normalizedCandidate;
  };

  if (dayMonthMatch) {
    const [, day, monthString, year] = dayMonthMatch;
    const month = monthLookup[monthString];
    if (typeof month === 'number') {
      return createDate(day, month, year);
    }
  }

  if (monthDayMatch) {
    const [, monthString, day, year] = monthDayMatch;
    const month = monthLookup[monthString];
    if (typeof month === 'number') {
      return createDate(day, month, year);
    }
  }

  if (numericMatch) {
    const [, part1, part2, part3] = numericMatch;
    const day = Number(part1);
    const monthIndex = Number(part2) - 1;
    const year = part3 ? Number(part3.length === 2 ? `20${part3}` : part3) : baseDate.getFullYear();
    return createDate(day, monthIndex, year);
  }

  const naturalDate = new Date(speech);
  if (naturalDate.toString() !== 'Invalid Date') {
    return normalizeDate(naturalDate);
  }

  return null;
};

const parseSpokenTimeTo24Hour = (speech) => {
  if (!speech) return null;
  const lower = speech.toLowerCase();
  const match = lower.match(/(\d{1,2})(?:[:\.\s](\d{2}))?/);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  let minutes = match[2] ? parseInt(match[2], 10) : 0;

  if (Number.isNaN(hours) || Number.isNaN(minutes) || minutes >= 60) {
    return null;
  }

  const mentionsMorning = lower.includes('am') || lower.includes('morning');
  const mentionsEvening = lower.includes('pm') || lower.includes('evening') || lower.includes('night') || lower.includes('afternoon');

  if (mentionsEvening && hours < 12) {
    hours += 12;
  }

  if ((mentionsMorning || lower.includes('midnight')) && hours === 12) {
    hours = 0;
  }

  if (!mentionsMorning && !mentionsEvening && hours > 12) {
    // Assume 24-hour input like 14:30
  }

  if (!mentionsMorning && !mentionsEvening && hours <= 7) {
    // Assume morning if not specified and small hour to avoid 00 fallback
    // Leave as-is; slot matching will validate.
  }

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

const findSlotBySpokenTime = (speech, slots = []) => {
  if (!speech || !Array.isArray(slots)) return null;
  const lower = speech.toLowerCase();

  const directMatch = slots.find((slot) => getSlotLabel(slot).toLowerCase().includes(lower));
  if (directMatch) return directMatch;

  const parsedStartTime = parseSpokenTimeTo24Hour(speech);
  if (!parsedStartTime) return null;

  return slots.find((slot) => slot.startTime === parsedStartTime) || null;
};

const getStoredUserInfo = () => {
  try {
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
      return { name: 'Unknown Patient' };
    }

    const parsed = JSON.parse(storedUser);
    if (parsed && typeof parsed === 'object') {
      return { name: parsed.name || 'Unknown Patient' };
    }
  } catch (parseError) {
    console.warn('Unable to parse stored user payload:', parseError);
  }

  return { name: 'Unknown Patient' };
};

const persistAppointmentLocally = async (appointment) => {
  try {
    // BACKEND-FIRST APPOINTMENT PERSISTENCE SYSTEM (SOLVES LOCALSTORAGE ISOLATION)
    let doctorName = appointment.doctor?.name || 'Dr. Demo';
    
    // Ensure consistent doctor naming
    if (!doctorName.startsWith('Dr.')) {
      doctorName = `Dr. ${doctorName}`;
    }
    
    // Create the standardized appointment
    const standardizedAppointment = {
      ...appointment,
      doctor: {
        ...appointment.doctor,
        name: doctorName,
        specialty: appointment.doctor?.specialty || 'General Physician',
        city: appointment.doctor?.city || 'Demo City',
        address: appointment.doctor?.address || 'Demo Hospital'
      },
      doctorName: doctorName,
      doctorId: `doctor-${doctorName.replace(/\s/g, '-').toLowerCase()}`,
      linkedAt: new Date().toISOString(),
      status: appointment.status || 'confirmed'
    };
    
    // First, link appointment to doctor properly
    const linkedAppointment = linkAppointmentToDoctor(standardizedAppointment, doctorName);
    
    console.log(`✅ Appointment created and linked to ${doctorName}:`, linkedAppointment.id);
    
    // CRITICAL FIX: SAVE TO BACKEND DATABASE FIRST (SOLVES CROSS-TAB ISSUE)
    const appointmentData = {
      id: linkedAppointment.id,
      doctorId: linkedAppointment.doctorId,
      doctorName: doctorName,
      patientName: linkedAppointment.patientName,
      date: linkedAppointment.date,
      time: linkedAppointment.time,
      reason: linkedAppointment.reason,
      status: linkedAppointment.status || 'confirmed',
      createdAt: linkedAppointment.bookedAt || new Date().toISOString(),
      patientId: appointment.patientId || 'patient-demo'
    };

    // 🔥 STEP 1: Save to Backend Database (PRIMARY STORAGE)
    try {
      console.log('🔄 Saving appointment to backend database...');
      const backendResponse = await appointmentAPI.create(appointmentData);
      console.log('✅ Backend save successful:', backendResponse?.data?.id);
      
      // Update with backend ID if provided
      if (backendResponse?.data?.id) {
        appointmentData.backendId = backendResponse.data.id;
      }
      
    } catch (backendError) {
      console.error('⚠️ Backend save failed, using localStorage fallback:', backendError);
      // Continue with localStorage as fallback
    }

    // 🔥 STEP 2: Save to localStorage (BACKUP STORAGE)
    // Multiple update triggers to ensure visibility
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('appointments:updated'));
      window.dispatchEvent(new CustomEvent('appointments:linked', { detail: appointmentData }));
      window.dispatchEvent(new CustomEvent('storage', { key: 'appointments', newValue: localStorage.getItem('appointments') }));
    }, 100);
    
    // 🔥 STEP 3: Sync across devices and tabs
    syncAppointmentAcrossDevices(appointmentData);
    console.log('📡 Appointment synced across devices:', appointmentData.id);
    
    // 🔥 STEP 4: Real-time broadcast to all connected clients
    if (window.realTimeSync) {
      window.realTimeSync.broadcastAppointmentUpdate(appointmentData);
    }

    // 🔥 STEP 5: Notify all doctors via Socket.IO
    if (window.socket) {
      window.socket.emit('appointmentBooked', appointmentData);
      console.log('📡 Socket notification sent to all doctors');
    }
    
  } catch (storageError) {
    console.error('Failed to persist appointment:', storageError);
  }
};

const BookAppointment = ({ user }) => {
  const navigate = useNavigate();
  const recognitionRef = useRef(null);

  const [date, setDate] = useState(new Date());
  const [timeSlot, setTimeSlot] = useState(null);
  const [doctorId, setDoctorId] = useState('');
  const [reasonForVisit, setReasonForVisit] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [notes, setNotes] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isLoading, setIsLoading] = useState({ doctors: false, slots: false, submit: false });
  const [error, setError] = useState({ doctors: null, slots: null, submit: null });
  const [successMessage, setSuccessMessage] = useState('');
  const [voiceSequenceStep, setVoiceSequenceStep] = useState(null);
  const [voiceFeedback, setVoiceFeedback] = useState('');
  const [latestVoiceInput, setLatestVoiceInput] = useState('');
  const [pendingVoiceTime, setPendingVoiceTime] = useState(null);
  const voiceFeedbackTimeoutRef = useRef(null);

  const fetchDoctors = async () => {
    setIsLoading((prev) => ({ ...prev, doctors: true }));
    setError((prev) => ({ ...prev, doctors: null }));

    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch('http://localhost:5000/api/doctors?limit=100', {
        headers
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch doctors');
      }

      const backendDoctors = Array.isArray(data.data) ? data.data : [];

      const locationByName = new Map(
        doctorsWithLocation.map((doc) => [normalizeNameKey(doc.name), doc])
      );

      const enhancedBackend = backendDoctors.map((doctor) => {
        const nameKey = normalizeNameKey(doctor.userId?.name || doctor.name || '');
        const locationInfo = locationByName.get(nameKey);
        const doctorUserId = getDoctorUserId(doctor);

        return {
          ...doctor,
          name: doctor.userId?.name || doctor.name || '',
          isMock: false,
          displayImage: doctor.userId?.profileImage || doctor.image || locationInfo?.image || '',
          displayCity: locationInfo?.city || doctor.hospitalAffiliation?.city || doctor.userId?.address?.city || '',
          displayAddress: locationInfo?.address || doctor.hospitalAffiliation?.address || '',
          displayAvailability: locationInfo?.availability || (doctor.isAvailable === false ? 'Not Available' : 'Available Today'),
          displayRating: locationInfo?.rating || doctor.rating || null,
          displayExperience: locationInfo?.experience || (typeof doctor.experience === 'number'
            ? `${doctor.experience} years experience`
            : doctor.experience || ''),
          displayFee: doctor.consultationFee ?? fallbackFeeByName[nameKey] ?? null
        };
      });

      const existingNames = new Set(
        enhancedBackend.map((doctor) => normalizeNameKey(doctor.userId?.name || doctor.name || ''))
      );

      const fallbackMockDoctors = doctorsWithLocation
        .filter((mockDoctor) => !existingNames.has(normalizeNameKey(mockDoctor.name)))
        .map((mockDoctor) => ({
          _id: `mock-${mockDoctor.id}`,
          userId: null,
          name: mockDoctor.name,
          specialty: mockDoctor.specialty,
          consultationFee: fallbackFeeByName[normalizeNameKey(mockDoctor.name)] ?? null,
          displayImage: mockDoctor.image || '',
          displayCity: mockDoctor.city,
          displayAddress: mockDoctor.address || '',
          displayAvailability: mockDoctor.availability,
          displayRating: mockDoctor.rating || null,
          displayExperience: mockDoctor.experience || '',
          displayFee: fallbackFeeByName[normalizeNameKey(mockDoctor.name)] ?? null,
          isMock: true
        }));

      setDoctors([...enhancedBackend, ...fallbackMockDoctors]);
    } catch (fetchError) {
      console.error('Error fetching doctors:', fetchError);
      setDoctors(doctorsWithLocation.map((mockDoctor) => ({
        _id: `mock-${mockDoctor.id}`,
        userId: null,
        name: mockDoctor.name,
        specialty: mockDoctor.specialty,
        consultationFee: fallbackFeeByName[normalizeNameKey(mockDoctor.name)] ?? null,
        displayImage: mockDoctor.image || '',
        displayCity: mockDoctor.city,
        displayAddress: mockDoctor.address || '',
        displayAvailability: mockDoctor.availability,
        displayRating: mockDoctor.rating || null,
        displayExperience: mockDoctor.experience || '',
        displayFee: fallbackFeeByName[normalizeNameKey(mockDoctor.name)] ?? null,
        isMock: true
      })));
      setError((prev) => ({ ...prev, doctors: 'Failed to load doctors. Please try again.' }));
    } finally {
      setIsLoading((prev) => ({ ...prev, doctors: false }));
    }
  };

  // Load doctors and configure speech recognition on mount
  useEffect(() => {
    fetchDoctors();

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .slice(event.resultIndex)
          .map((result) => result[0].transcript)
          .join(' ')
          .trim();

        if (transcript) {
          setLatestVoiceInput(transcript);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setVoiceSequenceStep(null);
        setPendingVoiceTime(null);
        setLatestVoiceInput('');
      };

      recognition.onend = () => {
        setIsListening(false);
        setVoiceSequenceStep(null);
        setPendingVoiceTime(null);
        setLatestVoiceInput('');
      };

      recognitionRef.current = recognition;
      setIsSpeechSupported(true);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (voiceFeedbackTimeoutRef.current) {
        clearTimeout(voiceFeedbackTimeoutRef.current);
      }
    };
  }, []);

  // Fetch available time slots when doctor or date changes
  useEffect(() => {
    const backendDoctorId = getDoctorUserId(selectedDoctor);

    if (!selectedDoctor) {
      setAvailableSlots([]);
      setTimeSlot(null);
      setIsLoading((prev) => ({ ...prev, slots: false }));
      return;
    }

    if (!backendDoctorId) {
      // Mock doctor selections use prebuilt slots and do not require backend fetch.
      setIsLoading((prev) => ({ ...prev, slots: false }));
      return;
    }

    const controller = new AbortController();
    const fetchSlots = async () => {
      setIsLoading((prev) => ({ ...prev, slots: true }));
      setError((prev) => ({ ...prev, slots: null }));
      setTimeSlot(null);

      try {
        const token = localStorage.getItem('token');
        const normalizedDate = normalizeDate(date);

        const params = new URLSearchParams({
          doctorId: backendDoctorId,
          date: normalizedDate.toISOString()
        });

        const headers = { 'Content-Type': 'application/json' };
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`http://localhost:5000/api/appointments/available-slots?${params.toString()}`, {
          headers,
          signal: controller.signal
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch time slots');
        }

        setAvailableSlots(Array.isArray(data.slots) ? data.slots : []);
      } catch (slotError) {
        if (slotError.name === 'AbortError') {
          return;
        }
        console.error('Error fetching time slots:', slotError);
        setAvailableSlots([]);
        setError((prev) => ({ ...prev, slots: slotError.message || 'Failed to fetch time slots. Please try again.' }));
      } finally {
        setIsLoading((prev) => ({ ...prev, slots: false }));
      }
    };

    fetchSlots();

    return () => {
      controller.abort();
    };
  }, [selectedDoctor, date]);

  useEffect(() => {
    if (!pendingVoiceTime || !Array.isArray(availableSlots) || availableSlots.length === 0) {
      return;
    }

    if (voiceFeedbackTimeoutRef.current) {
      clearTimeout(voiceFeedbackTimeoutRef.current);
      voiceFeedbackTimeoutRef.current = null;
    }

    const match = findSlotBySpokenTime(pendingVoiceTime, availableSlots);
    if (!match) {
      const preview = availableSlots
        .slice(0, 5)
        .map((slot) => getSlotLabel(slot))
        .join(', ');
      setVoiceFeedback(`No matching slot for ${pendingVoiceTime}. Try one of these: ${preview}`);
      return;
    }

    setTimeSlot(match);
    setVoiceSequenceStep('reason');
    setPendingVoiceTime(null);
    setVoiceFeedback(`Time slot ${getSlotLabel(match)} selected. Finally, please state the reason for your visit.`);
    voiceFeedbackTimeoutRef.current = setTimeout(() => {
      setVoiceFeedback('');
      voiceFeedbackTimeoutRef.current = null;
    }, 6000);
  }, [pendingVoiceTime, availableSlots]);

  useEffect(() => {
    const input = latestVoiceInput.trim();
    if (!input) {
      return;
    }

    const clearFeedbackTimeout = () => {
      if (voiceFeedbackTimeoutRef.current) {
        clearTimeout(voiceFeedbackTimeoutRef.current);
        voiceFeedbackTimeoutRef.current = null;
      }
    };

    const showFeedback = (message, autoHideAfterMs = null) => {
      clearFeedbackTimeout();
      setVoiceFeedback(message);
      if (typeof autoHideAfterMs === 'number') {
        voiceFeedbackTimeoutRef.current = setTimeout(() => {
          setVoiceFeedback('');
          voiceFeedbackTimeoutRef.current = null;
        }, autoHideAfterMs);
      }
    };

    const finishSequence = (message) => {
      showFeedback(message, 5000);
      setVoiceSequenceStep(null);
      setPendingVoiceTime(null);
      setIsListening(false);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (stopError) {
          console.warn('Voice recognition stop warning:', stopError);
        }
      }
    };

    const handleDoctorStep = () => {
      const match = findDoctorBySpokenName(input, doctors);
      if (!match) {
        showFeedback(`I couldn't find "${input}". Please repeat the doctor's name as it appears on screen.`);
        return;
      }

      handleDoctorSelection(match);
      setVoiceSequenceStep('date');
      showFeedback(`Doctor ${match.userId?.name || match.name} selected. Please say the appointment date.`);
    };

    const handleDateStep = () => {
      const parsed = parseSpokenDate(input, new Date());
      if (!parsed) {
        showFeedback('I could not understand the date. Try saying something like "15 November" or "tomorrow".');
        return;
      }

      setDate(parsed);
      setVoiceSequenceStep('time');
      setPendingVoiceTime(null);
      showFeedback(`Date set to ${parsed.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}. Please say the preferred time.`);
    };

    const attemptTimeSelection = (spokenTime) => {
      if (!selectedDoctor) {
        showFeedback('Select a doctor first, then choose a time.');
        return;
      }

      if (!Array.isArray(availableSlots) || availableSlots.length === 0) {
        setPendingVoiceTime(spokenTime);
        showFeedback('Fetching available slots from the doctor. Please wait a moment...');
        return;
      }

      const slotMatch = findSlotBySpokenTime(spokenTime, availableSlots);
      if (!slotMatch) {
        const preview = availableSlots
          .slice(0, 5)
          .map((slot) => getSlotLabel(slot))
          .join(', ');
        showFeedback(`I couldn't match that time. Try one of these: ${preview}`);
        return;
      }

      setTimeSlot(slotMatch);
      setVoiceSequenceStep('reason');
      setPendingVoiceTime(null);
      showFeedback(`Time slot ${getSlotLabel(slotMatch)} selected. Finally, please state the reason for your visit.`);
    };

    const handleReasonStep = () => {
      const reasonText = input;
      setReasonForVisit(reasonText);
      showFeedback('Reason captured. Booking appointment now...');

      const attemptBooking = async () => {
        const result = await handleSubmit(null, {
          voiceTriggered: true,
          overrideReasonForVisit: reasonText
        });

        if (result?.success) {
          const successMessage = result.mocked
            ? 'Appointment saved locally using voice input! You can review it in My Appointments.'
            : 'Appointment booked successfully using voice input! Redirecting you shortly.';
          finishSequence(successMessage);
        } else {
          finishSequence('I could not complete the booking automatically. Please review the form and submit manually.');
        }
      };

      attemptBooking().catch((bookingError) => {
        console.warn('Voice-triggered booking failed:', bookingError);
        finishSequence('There was an error booking via voice. Please review the details and submit manually.');
      });
    };

    if (!voiceSequenceStep) {
      setReasonForVisit((prev) => (prev ? `${prev} ${input}`.trim() : input));
      showFeedback('Added to reason for visit.', 3000);
      setLatestVoiceInput('');
      return;
    }

    switch (voiceSequenceStep) {
      case 'doctor':
        handleDoctorStep();
        break;
      case 'date':
        handleDateStep();
        break;
      case 'time':
        attemptTimeSelection(input);
        break;
      case 'reason':
        handleReasonStep();
        break;
      default:
        setReasonForVisit((prev) => (prev ? `${prev} ${input}`.trim() : input));
    }

    setLatestVoiceInput('');
  }, [latestVoiceInput, voiceSequenceStep, doctors, availableSlots, selectedDoctor]);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setVoiceSequenceStep(null);
      setPendingVoiceTime(null);
      setLatestVoiceInput('');
      if (voiceFeedbackTimeoutRef.current) {
        clearTimeout(voiceFeedbackTimeoutRef.current);
        voiceFeedbackTimeoutRef.current = null;
      }
      setVoiceFeedback('');
    } else {
      try {
        if (voiceFeedbackTimeoutRef.current) {
          clearTimeout(voiceFeedbackTimeoutRef.current);
          voiceFeedbackTimeoutRef.current = null;
        }
        setVoiceSequenceStep('doctor');
        setPendingVoiceTime(null);
        setLatestVoiceInput('');
        setVoiceFeedback('Voice booking started. Please say the doctor name to begin.');
        voiceFeedbackTimeoutRef.current = setTimeout(() => {
          setVoiceFeedback('');
          voiceFeedbackTimeoutRef.current = null;
        }, 6000);
        recognitionRef.current.start();
        setIsListening(true);
      } catch (errorStartingRecognition) {
        console.error('Unable to start speech recognition:', errorStartingRecognition);
        setVoiceSequenceStep(null);
        setPendingVoiceTime(null);
        setVoiceFeedback('');
      }
    }
  };

  const handleDateChange = (value) => {
    setSuccessMessage('');
    setError((prev) => ({ ...prev, slots: null }));
    setTimeSlot(null);
    setDate(Array.isArray(value) ? value[0] : value);
    if (selectedDoctor && !getDoctorUserId(selectedDoctor)) {
      setAvailableSlots(buildMockSlots());
    } else if (selectedDoctor) {
      setAvailableSlots([]);
    }
  };

  const handleDoctorSelection = (doctor) => {
    const backendDoctorId = getDoctorUserId(doctor);
    const selectionKey = backendDoctorId || doctor._id || normalizeNameKey(doctor.name || '');
    const selectionKeyString = typeof selectionKey === 'string' ? selectionKey : String(selectionKey);

    setDoctorId(selectionKeyString);
    setSelectedDoctor(doctor);
    setSuccessMessage('');
    setError((prev) => ({ ...prev, submit: null, slots: null }));
    setTimeSlot(null);

    if (!backendDoctorId) {
      setIsLoading((prev) => ({ ...prev, slots: false }));
      setAvailableSlots(buildMockSlots());
      return;
    }

    setAvailableSlots([]);
  };

  const handleSubmit = async (event, options = {}) => {
    const { voiceTriggered = false, overrideReasonForVisit } = options;
    if (event?.preventDefault) {
      event.preventDefault();
    }

    const effectiveReason = (overrideReasonForVisit ?? reasonForVisit)?.trim() || '';

    if (overrideReasonForVisit !== undefined) {
      setReasonForVisit(overrideReasonForVisit);
    }

    if (!doctorId || !selectedDoctor) {
      setError((prev) => ({ ...prev, submit: 'Please select a doctor' }));
      return { success: false, reason: 'validation' };
    }

    if (!date) {
      setError((prev) => ({ ...prev, submit: 'Please select a date' }));
      return { success: false, reason: 'validation' };
    }

    if (!timeSlot) {
      setError((prev) => ({ ...prev, submit: 'Please select a time slot' }));
      return { success: false, reason: 'validation' };
    }

    if (!effectiveReason) {
      setError((prev) => ({ ...prev, submit: 'Please provide a reason for visit' }));
      return { success: false, reason: 'validation' };
    }

    setIsLoading((prev) => ({ ...prev, submit: true }));
    setError((prev) => ({ ...prev, submit: null }));
    setSuccessMessage('');

    try {
      const normalizedAppointmentDate = normalizeDate(date).toISOString();
      const slotPayload = {
        startTime: timeSlot.startTime,
        endTime: timeSlot.endTime,
        label: getSlotLabel(timeSlot)
      };

      const backendDoctorId = getDoctorUserId(selectedDoctor);
      const isMockDoctor = !backendDoctorId;

      if (isMockDoctor) {
        const mockAppointmentId = `mock-${Date.now()}`;
        const doctorDisplayName = selectedDoctor.userId?.name || selectedDoctor.name || 'Doctor';
        const doctorCity = selectedDoctor.displayCity || selectedDoctor.userId?.address?.city || '';
        const doctorSpecialty = selectedDoctor.specialty || 'General Consultation';
        const doctorImage = selectedDoctor.displayImage || selectedDoctor.userId?.profileImage || '';
        const doctorAddress = selectedDoctor.displayAddress || selectedDoctor.hospitalAffiliation?.address || '';
        const patientName = user?.name || getStoredUserInfo().name;

        // Ensure doctor name has "Dr." prefix for proper linking
        const formattedDoctorName = doctorDisplayName.startsWith('Dr.') 
          ? doctorDisplayName 
          : `Dr. ${doctorDisplayName}`;

        const appointmentData = {
          id: mockAppointmentId,
          doctor: {
            name: formattedDoctorName,
            specialty: doctorSpecialty,
            image: doctorImage,
            city: doctorCity,
            address: doctorAddress
          },
          patientName,
          date: normalizedAppointmentDate,
          time: getSlotLabel(timeSlot),
          reason: effectiveReason,
          status: 'confirmed',
          bookedAt: new Date().toISOString(),
          isMock: true
        };

        persistAppointmentLocally(appointmentData);
        
        // Immediately notify doctors via real-time sync and cross-tab sync
        if (window.realTimeSync && window.realTimeSync.isConnected) {
          console.log('📡 Broadcasting new appointment to doctors:', formattedDoctorName);
          window.realTimeSync.broadcastAppointmentCreated(appointmentData);
          
          // Force immediate cross-tab synchronization
          window.realTimeSync.syncAppointmentsAcrossTabs();
        }
        
        // Also trigger global merge function if available
        if (window.mergeAppointmentsFromAllSources) {
          setTimeout(() => {
            window.mergeAppointmentsFromAllSources();
          }, 100);
        }

        setSuccessMessage('Appointment saved! This doctor is part of the demo list, so the booking is stored locally.');
        setTimeout(() => {
          setSuccessMessage('');
        }, 4000);

        setDoctorId('');
        setSelectedDoctor(null);
        setDate(new Date());
        setTimeSlot(null);
        setReasonForVisit('');
        setSymptoms('');
        setNotes('');
        setAvailableSlots([]);
        return { success: true, mocked: true };
      }

      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Please log in to book an appointment');
      }

      const appointmentData = {
        doctorId: backendDoctorId,
        appointmentDate: normalizedAppointmentDate,
        timeSlot: slotPayload,
        reasonForVisit: effectiveReason,
        symptoms: symptoms.trim() ? symptoms.split(',').map((symptom) => symptom.trim()).filter(Boolean) : [],
        notes: notes.trim()
      };

      const response = await fetch('http://localhost:5000/api/appointments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(appointmentData)
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to book appointment');
      }

      const patientName = user?.name || getStoredUserInfo().name;
      const doctorDisplayName = selectedDoctor.userId?.name || selectedDoctor.name || 'Doctor';
      const doctorCity = selectedDoctor.displayCity || selectedDoctor.userId?.address?.city || '';
      const doctorSpecialty = selectedDoctor.specialty || 'General Consultation';
      const doctorImage = selectedDoctor.displayImage || selectedDoctor.userId?.profileImage || '';
      const appointmentId = data.data?._id || `appt-${Date.now()}`;
      const appointmentStatus = data.data?.status || 'confirmed';
      const doctorAddress = selectedDoctor.displayAddress || selectedDoctor.hospitalAffiliation?.address || '';

      // Appointment is now stored in backend database
      // No need for localStorage persistence as it will be fetched from API
      console.log('✅ Appointment booked in backend:', appointmentId);

      setSuccessMessage(voiceTriggered
        ? 'Appointment booked successfully using voice input! Redirecting to your appointments...'
        : 'Appointment booked successfully! Redirecting to your appointments...');

      // Reset the form
      setDoctorId('');
      setSelectedDoctor(null);
      setDate(new Date());
      setTimeSlot(null);
      setReasonForVisit('');
      setSymptoms('');
      setNotes('');
      setAvailableSlots([]);

      setTimeout(() => {
        navigate('/appointments');
      }, 2000);
      return { success: true, mocked: false };
    } catch (submitError) {
      console.error('Booking error:', submitError);
      setError((prev) => ({
        ...prev,
        submit: submitError.message || 'Failed to book appointment. Please try again.'
      }));
      return { success: false, reason: 'error', error: submitError };
    } finally {
      setIsLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  const renderDoctorCard = (doctor) => {
    const doctorUserId = getDoctorUserId(doctor);
    const selectionKey = doctorUserId || doctor._id || normalizeNameKey(doctor.name || '');
    const selectionKeyString = typeof selectionKey === 'string' ? selectionKey : String(selectionKey);
    const isBackendDoctor = Boolean(doctorUserId);
    const isSelected = doctorId === selectionKeyString;
    const displayName = doctor.userId?.name || doctor.name || 'Dr. Name Not Available';
    const displaySpecialty = doctor.specialty || 'Specialty Not Specified';
    const displayCity = doctor.displayCity || doctor.userId?.address?.city || 'Location Not Specified';
    const displayFee = doctor.displayFee ?? doctor.consultationFee;

    return (
      <button
        key={doctor._id || selectionKeyString}
        type="button"
        className={`doctor-card${isSelected ? ' selected' : ''}${isBackendDoctor ? '' : ' mock-doctor'}`}
        onClick={() => handleDoctorSelection(doctor)}
        title={isBackendDoctor ? '' : 'Demo doctor - booking stored locally'}
      >
        <h3>{displayName}</h3>
        <p className="specialty">{displaySpecialty}</p>
        <p className="location">{displayCity}</p>
        {doctor.displayExperience && (
          <p className="experience-text">{doctor.displayExperience}</p>
        )}
        {doctor.displayAvailability && (
          <p className="availability">{doctor.displayAvailability}</p>
        )}
        {doctor.displayRating && (
          <p className="rating">⭐ {doctor.displayRating}</p>
        )}
        {displayFee && (
          <p className="fee">Fee: ₹{displayFee}</p>
        )}
        {doctor.displayAddress && (
          <p className="address">{doctor.displayAddress}</p>
        )}
        {!isBackendDoctor && (
          <p className="demo-note">Demo profile - booking saved locally</p>
        )}
      </button>
    );
  };

  return (
    <div className="book-appointment-container">
      <h2>Book an Appointment</h2>

      {successMessage && (
        <div className="success-message">✓ {successMessage}</div>
      )}

      {error.submit && (
        <div className="error-message">✗ {error.submit}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Select Doctor: <span className="required">*</span></label>
          <div className="doctors-grid">
            {isLoading.doctors ? (
              <div className="loading-message">Loading doctors...</div>
            ) : error.doctors ? (
              <div className="error-message">
                {error.doctors}
                <button type="button" onClick={fetchDoctors} className="retry-button">
                  Retry Loading Doctors
                </button>
              </div>
            ) : doctors.length === 0 ? (
              <div className="info-message">
                No doctors available at the moment.
                <button type="button" onClick={fetchDoctors} className="retry-button">
                  Refresh List
                </button>
              </div>
            ) : (
              doctors.map(renderDoctorCard)
            )}
          </div>

          {selectedDoctor && (
            <div className="selected-doctor-info">
              <h4>Selected Doctor</h4>
              <p><strong>Name:</strong> {selectedDoctor.userId?.name || selectedDoctor.name}</p>
              <p><strong>Specialty:</strong> {selectedDoctor.specialty || 'Not specified'}</p>
              {(selectedDoctor.consultationFee ?? selectedDoctor.displayFee) && (
                <p><strong>Consultation Fee:</strong> ₹{selectedDoctor.consultationFee ?? selectedDoctor.displayFee}</p>
              )}
              {Array.isArray(selectedDoctor.availableDays) && selectedDoctor.availableDays.length > 0 && (
                <p><strong>Available Days:</strong> {selectedDoctor.availableDays.join(', ')}</p>
              )}
              {Array.isArray(selectedDoctor.availableTimeSlots) && selectedDoctor.availableTimeSlots.length > 0 && (
                <p><strong>Typical Time Slots:</strong> {selectedDoctor.availableTimeSlots.length} configured</p>
              )}
              {!getDoctorUserId(selectedDoctor) && (
                <p className="local-booking-note">Demo doctor - appointment will be stored locally on this device.</p>
              )}
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Select Date: <span className="required">*</span></label>
          <Calendar
            onChange={handleDateChange}
            value={date}
            minDate={new Date()}
            disabled={!doctorId}
          />
          {!doctorId && <p className="hint-text">Please select a doctor first</p>}
        </div>

        <div className="form-group">
          <label>Select Time Slot: <span className="required">*</span></label>
          <div className="time-slots-grid">
            {!doctorId ? (
              <div className="info-message">Please select a doctor first</div>
            ) : isLoading.slots ? (
              <div className="loading-message">Loading time slots...</div>
            ) : error.slots ? (
              <div className="error-message">{error.slots}</div>
            ) : availableSlots.length === 0 ? (
              <div className="info-message">No time slots available for the selected date. Please choose another date.</div>
            ) : (
              availableSlots.map((slot) => (
                <button
                  key={slot.startTime}
                  type="button"
                  className={`time-slot-button ${timeSlot?.startTime === slot.startTime ? 'selected' : ''}`}
                  onClick={() => setTimeSlot(slot)}
                >
                  {getSlotLabel(slot)}
                </button>
              ))
            )}
          </div>
        </div>

        <div className="form-group">
          <label>Reason for Visit: <span className="required">*</span></label>
          <div className="reason-input-container">
            <textarea
              value={reasonForVisit}
              onChange={(event) => setReasonForVisit(event.target.value)}
              placeholder="Enter reason for visit or use voice input"
              rows="3"
              required
            />
            <button
              type="button"
              className={`mic-button ${isListening ? 'listening' : ''}`}
              onClick={toggleVoiceInput}
              title={isListening ? 'Stop recording' : 'Start voice input'}
              disabled={!isSpeechSupported}
            >
              {isListening ? '🔴' : '🎤'}
            </button>
          </div>
          {isListening && <p className="hint-text recording">Recording... Speak now</p>}
          {!isSpeechSupported && (
            <p className="hint-text">Voice input is not supported in this browser.</p>
          )}
        </div>

        <div className="form-group">
          <label>Symptoms (Optional):</label>
          <input
            type="text"
            value={symptoms}
            onChange={(event) => setSymptoms(event.target.value)}
            placeholder="Comma-separated symptoms (e.g., fever, headache, cough)"
          />
        </div>

        <div className="form-group">
          <label>Additional Notes (Optional):</label>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Any additional information you want to share with the doctor"
            rows="2"
          />
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="submit-button"
            disabled={isLoading.submit || !doctorId || !timeSlot || !reasonForVisit.trim()}
          >
            {isLoading.submit ? (
              <>
                <span className="spinner"></span>
                Booking...
              </>
            ) : (
              'Book Appointment'
            )}
          </button>

          <button
            type="button"
            className="cancel-button"
            onClick={() => navigate('/dashboard')}
            disabled={isLoading.submit}
          >
            Cancel
          </button>
        </div>
      </form>
      {voiceFeedback && (
        <div className="voice-feedback">{voiceFeedback}</div>
      )}
    </div>
  );
};

export default BookAppointment;