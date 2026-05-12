import './WelcomeScreen.css'

interface WelcomeScreenProps {
  userName: string
  onBegin: () => void
}

export function WelcomeScreen({ userName, onBegin }: WelcomeScreenProps) {
  return (
    <div className="screen welcome-screen">
      <div className="col-grid welcome-screen__turn">
        <span className="welcome-screen__label">Sage</span>
        <div className="welcome-screen__rule" />
        <p className="welcome-screen__text">
          Good to have you back, {userName}.
        </p>
      </div>

      <div className="col-grid welcome-screen__turn">
        <span className="welcome-screen__label">Sage</span>
        <div className="welcome-screen__rule" />
        <p className="welcome-screen__text">
          Today: Mathematics · 17 questions · JEE Main · ~8 min.
        </p>
      </div>

      <div className="welcome-screen__spacer" />

      <div className="welcome-screen__break">
        <span className="welcome-screen__break-label">Your move</span>
        <button
          className="welcome-screen__begin"
          onClick={onBegin}
          aria-label="Begin"
        >
          Begin
        </button>
        <input
          className="welcome-screen__redirect b-redirect"
          type="text"
          placeholder="Or tell Sage something different…"
          aria-label="Tell Sage something different"
        />
      </div>
    </div>
  )
}
