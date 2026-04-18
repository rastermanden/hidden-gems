<template>
  <div class="auth-screen">
    <div class="auth-hero">
      <svg class="auth-gem-icon" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polygon points="28,4 50,18 50,38 28,52 6,38 6,18" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.5)" stroke-width="1.5"/>
        <polygon points="28,4 50,18 28,28" fill="rgba(255,255,255,0.2)"/>
        <polygon points="28,4 6,18 28,28" fill="rgba(255,255,255,0.12)"/>
        <polygon points="6,18 28,28 6,38" fill="rgba(255,255,255,0.1)"/>
        <polygon points="50,18 28,28 50,38" fill="rgba(255,255,255,0.18)"/>
        <polygon points="28,28 6,38 28,52" fill="rgba(255,255,255,0.08)"/>
        <polygon points="28,28 50,38 28,52" fill="rgba(255,255,255,0.14)"/>
        <circle cx="28" cy="28" r="4" fill="rgba(255,255,255,0.6)"/>
      </svg>
      <div class="auth-logo">Hidden Gems</div>
      <div class="auth-sub">Your secret places, beautifully kept</div>
    </div>
    <div class="auth-box">
      <template v-if="!sent">
        <h2>Welcome back</h2>
        <p>Enter your email and we'll send you a magic link to sign in instantly.</p>
        <input class="auth-input" type="email" v-model="email" placeholder="you@example.com" @keyup.enter="sendMagicLink" />
        <button class="auth-btn" :disabled="loading" @click="sendMagicLink">
          {{ loading ? 'Sending…' : 'Send magic link →' }}
        </button>
      </template>
      <div v-else class="auth-sent">
        <span class="big">📬</span>
        <p>Check your inbox!<br>Click the link in the email to sign in.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { db } from '../supabase.js'

const email = ref('')
const loading = ref(false)
const sent = ref(false)

async function sendMagicLink() {
  if (!email.value.trim()) return
  loading.value = true
  const redirectTo = window.location.hostname === 'localhost'
    ? 'http://localhost:8000'
    : 'https://rastermanden.github.io/hidden-gems/'
  const { error } = await db.auth.signInWithOtp({
    email: email.value.trim(),
    options: { shouldCreateUser: true, emailRedirectTo: redirectTo }
  })
  loading.value = false
  if (error) { alert('Error: ' + error.message); return }
  sent.value = true
}
</script>

<style scoped>
.auth-screen {
  position: fixed;
  inset: 0;
  background: var(--ink);
  z-index: 200;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
  overflow: hidden;
}
.auth-screen::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cpath d='M0,200 Q100,100 200,200 T400,200' stroke='white' stroke-opacity='0.03' stroke-width='1' fill='none'/%3E%3Cpath d='M0,170 Q100,70 200,170 T400,170' stroke='white' stroke-opacity='0.03' stroke-width='1' fill='none'/%3E%3Cpath d='M0,230 Q100,130 200,230 T400,230' stroke='white' stroke-opacity='0.03' stroke-width='1' fill='none'/%3E%3C/svg%3E");
  background-size: 400px 400px;
}
.auth-hero {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 36px;
}
.auth-gem-icon {
  width: 56px;
  height: 56px;
  margin-bottom: 14px;
  filter: drop-shadow(0 4px 12px rgba(0,0,0,0.3));
}
.auth-logo {
  font-family: var(--serif);
  font-size: 32px;
  color: white;
  margin-bottom: 6px;
  letter-spacing: 0.01em;
  text-shadow: 0 2px 8px rgba(0,0,0,0.2);
}
.auth-sub {
  font-size: 13px;
  color: rgba(255,255,255,0.65);
  font-style: italic;
  font-family: var(--serif);
}
.auth-box {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 360px;
  background: white;
  border-radius: 20px;
  padding: 26px 24px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.25), 0 4px 16px rgba(0,0,0,0.1);
}
.auth-box h2 {
  font-family: var(--serif);
  font-size: 20px;
  margin-bottom: 5px;
  color: var(--ink);
}
.auth-box p { font-size: 13px; color: var(--muted); margin-bottom: 20px; line-height: 1.55; }
.auth-input {
  width: 100%;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 13px 14px;
  font-size: 15px;
  font-family: var(--sans);
  background: var(--cream);
  color: var(--ink);
  outline: none;
  margin-bottom: 12px;
  -webkit-appearance: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.auth-input:focus {
  border-color: var(--focus-blue);
  box-shadow: 0 0 0 3px rgba(56,152,236,0.15);
  background: white;
}
.auth-btn {
  width: 100%;
  padding: 15px;
  background: var(--terracotta);
  color: var(--ivory);
  border: none;
  border-radius: var(--radius-sm);
  font-size: 15px;
  font-family: var(--sans);
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.12s;
  box-shadow: var(--terracotta) 0px 0px 0px 0px, var(--terracotta-dark) 0px 0px 0px 1px;
  letter-spacing: 0.01em;
}
.auth-btn:disabled { opacity: 0.5; box-shadow: none; }
.auth-btn:active { transform: scale(0.99); }
.auth-sent { text-align: center; padding: 8px 0; }
.auth-sent .big { font-size: 40px; margin-bottom: 10px; display: block; }
.auth-sent p { font-size: 14px; color: var(--muted); line-height: 1.65; }
</style>
