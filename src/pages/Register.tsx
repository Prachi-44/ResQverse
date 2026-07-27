import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { User, Mail, Lock, Phone, Heart, Users, ArrowRight, ShieldCheck } from 'lucide-react';

export const Register: React.FC = () => {
  const { registerUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    bloodGroup: '',
    c1Name: '',
    c1Phone: '',
    c1Relation: '',
    c2Name: '',
    c2Phone: '',
    c2Relation: '',
    c3Name: '',
    c3Phone: '',
    c3Relation: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!formData.bloodGroup) newErrors.bloodGroup = 'Blood group selection is required';

    // Emergency Contacts validation
    if (!formData.c1Name) newErrors.c1Name = 'Contact 1 name is required';
    if (!formData.c1Phone) newErrors.c1Phone = 'Contact 1 phone is required';
    if (!formData.c2Name) newErrors.c2Name = 'Contact 2 name is required';
    if (!formData.c2Phone) newErrors.c2Phone = 'Contact 2 phone is required';
    if (!formData.c3Name) newErrors.c3Name = 'Contact 3 name is required';
    if (!formData.c3Phone) newErrors.c3Phone = 'Contact 3 phone is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('Please correct the validation errors in the form.', 'error');
      return;
    }

    setLoading(true);
    try {
      const contacts = [
        { name: formData.c1Name, phone: formData.c1Phone, relation: formData.c1Relation || 'Family' },
        { name: formData.c2Name, phone: formData.c2Phone, relation: formData.c2Relation || 'Friend' },
        { name: formData.c3Name, phone: formData.c3Phone, relation: formData.c3Relation || 'Other' },
      ];

      await registerUser(
        formData.email,
        formData.password,
        formData.name,
        formData.phone,
        formData.bloodGroup,
        contacts
      );
      
      showToast('Registration complete. Guardian mesh activated.', 'success');
      navigate('/dashboard');
    } catch (error: any) {
      console.error(error);
      showToast(error.message || 'Registration failed. Try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 guardian-mesh-bg text-slate-800 dark:text-white transition-colors duration-300">
      <div className="w-full max-w-2xl glass-panel p-6 sm:p-8 rounded-3xl my-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-full bg-sky-500/10 border border-sky-500/20 mb-3 animate-pulse-slow">
            <ShieldCheck className="w-8 h-8 text-sky-600 dark:text-sky-400 text-glow" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
            Establish Guardian Node
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Register your critical details for instant automated SOS dispatch.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: User Profile Details */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 mb-4 pb-1 border-b border-slate-200 dark:border-slate-800">
              1. Personal Medical Profile
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="name"
                name="name"
                label="Full Name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                icon={<User className="w-4 h-4 text-slate-400 dark:text-slate-500" />}
                required
              />

              <Input
                id="email"
                name="email"
                type="email"
                label="Email Address"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                icon={<Mail className="w-4 h-4 text-slate-400 dark:text-slate-500" />}
                required
              />

              <Input
                id="password"
                name="password"
                type="password"
                label="Password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                icon={<Lock className="w-4 h-4 text-slate-400 dark:text-slate-500" />}
                required
              />

              <Input
                id="phone"
                name="phone"
                type="tel"
                label="Phone Number"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                icon={<Phone className="w-4 h-4 text-slate-400 dark:text-slate-500" />}
                required
              />

              {/* Blood Group Select */}
              <div className="flex flex-col gap-1.5 w-full">
                <label htmlFor="bloodGroup" className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 text-left">
                  Blood Group
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-slate-400 dark:text-slate-500">
                    <Heart className="w-4 h-4" />
                  </div>
                  <select
                    id="bloodGroup"
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    className={`w-full glass-input pl-10 pr-4 py-3 text-sm rounded-xl focus:ring-1 focus:ring-sky-500/50 border-slate-300 dark:border-slate-700/50 text-slate-800 dark:text-white bg-white/70 dark:bg-slate-900/90 ${
                      errors.bloodGroup ? 'border-red-500/50' : ''
                    }`}
                    required
                  >
                    <option value="" disabled className="text-slate-500">Select Blood Group</option>
                    {bloodGroups.map(bg => (
                      <option key={bg} value={bg} className="text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-900">{bg}</option>
                    ))}
                  </select>
                </div>
                {errors.bloodGroup && (
                  <span className="text-xs text-red-500 font-medium mt-0.5">{errors.bloodGroup}</span>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Emergency Contacts */}
          <div>
            <div className="flex items-center gap-2 mb-4 pb-1 border-b border-slate-200 dark:border-slate-800">
              <Users className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                2. Guardian Network (3 Contacts Required)
              </h3>
            </div>
            
            <div className="space-y-6">
              {/* Contact 1 */}
              <div className="p-4 rounded-2xl bg-slate-200/40 dark:bg-slate-900/30 border border-slate-350 dark:border-slate-800 space-y-4">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block text-left">Guardian Node 1 (Primary)</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    id="c1Name"
                    name="c1Name"
                    label="Contact Name"
                    placeholder="Jane Doe"
                    value={formData.c1Name}
                    onChange={handleChange}
                    error={errors.c1Name}
                  />
                  <Input
                    id="c1Phone"
                    name="c1Phone"
                    label="Phone Number"
                    placeholder="+1 (555) 111-1111"
                    value={formData.c1Phone}
                    onChange={handleChange}
                    error={errors.c1Phone}
                  />
                  <Input
                    id="c1Relation"
                    name="c1Relation"
                    label="Relation"
                    placeholder="Spouse / Parent"
                    value={formData.c1Relation}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Contact 2 */}
              <div className="p-4 rounded-2xl bg-slate-200/40 dark:bg-slate-900/30 border border-slate-350 dark:border-slate-800 space-y-4">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block text-left">Guardian Node 2</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    id="c2Name"
                    name="c2Name"
                    label="Contact Name"
                    placeholder="Robert Doe"
                    value={formData.c2Name}
                    onChange={handleChange}
                    error={errors.c2Name}
                  />
                  <Input
                    id="c2Phone"
                    name="c2Phone"
                    label="Phone Number"
                    placeholder="+1 (555) 222-2222"
                    value={formData.c2Phone}
                    onChange={handleChange}
                    error={errors.c2Phone}
                  />
                  <Input
                    id="c2Relation"
                    name="c2Relation"
                    label="Relation"
                    placeholder="Sibling / Friend"
                    value={formData.c2Relation}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Contact 3 */}
              <div className="p-4 rounded-2xl bg-slate-200/40 dark:bg-slate-900/30 border border-slate-350 dark:border-slate-800 space-y-4">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block text-left">Guardian Node 3</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    id="c3Name"
                    name="c3Name"
                    label="Contact Name"
                    placeholder="Alice Cooper"
                    value={formData.c3Name}
                    onChange={handleChange}
                    error={errors.c3Name}
                  />
                  <Input
                    id="c3Phone"
                    name="c3Phone"
                    label="Phone Number"
                    placeholder="+1 (555) 333-3333"
                    value={formData.c3Phone}
                    onChange={handleChange}
                    error={errors.c3Phone}
                  />
                  <Input
                    id="c3Relation"
                    name="c3Relation"
                    label="Relation"
                    placeholder="Neighbor / Doctor"
                    value={formData.c3Relation}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={loading}
            className="mt-6"
          >
            Register Profile & Activate Nodes
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-4">
            Already have an active Node?{' '}
            <Link to="/login" className="text-sky-600 dark:text-sky-400 font-bold underline transition-colors">
              Log In here
            </Link>
          </p>

        </form>
      </div>
    </div>
  );
};
