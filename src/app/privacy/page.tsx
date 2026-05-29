export default function PrivacyPage() {
  return (
    <div style={{
      maxWidth:   '800px',
      margin:     '0 auto',
      padding:    '60px 24px',
      fontFamily: 'Georgia, serif',
      color:      '#333',
      lineHeight: 1.8,
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>
        Politique de Confidentialité
      </h1>
      <p style={{ color: '#666', marginBottom: '40px' }}>
        AlmightyService — Dernière mise à jour : 29 mai 2026
      </p>

      <h2 style={{ fontSize: '1.3rem', marginTop: '32px', marginBottom: '12px' }}>
        1. Collecte des données
      </h2>
      <p>
        AlmightyService collecte uniquement les informations nécessaires à l&apos;organisation
        d&apos;événements : nom complet, numéro de téléphone WhatsApp, et préférences de boissons.
        Ces données sont fournies volontairement par les invités lors de la confirmation de leur
        présence à un événement.
      </p>

      <h2 style={{ fontSize: '1.3rem', marginTop: '32px', marginBottom: '12px' }}>
        2. Utilisation des données
      </h2>
      <p>
        Les données collectées sont utilisées exclusivement pour :
      </p>
      <ul style={{ paddingLeft: '24px', marginTop: '8px' }}>
        <li>Envoyer des invitations personnalisées via WhatsApp</li>
        <li>Gérer les confirmations de présence (RSVP)</li>
        <li>Organiser le plan de salle de l&apos;événement</li>
        <li>Faciliter le check-in le jour de l&apos;événement</li>
      </ul>

      <h2 style={{ fontSize: '1.3rem', marginTop: '32px', marginBottom: '12px' }}>
        3. Partage des données
      </h2>
      <p>
        AlmightyService ne vend, ne loue, ni ne partage vos données personnelles avec des tiers,
        à l&apos;exception des services techniques nécessaires au fonctionnement de la plateforme
        (Supabase pour le stockage, Meta WhatsApp Business pour la messagerie).
      </p>

      <h2 style={{ fontSize: '1.3rem', marginTop: '32px', marginBottom: '12px' }}>
        4. Messages WhatsApp
      </h2>
      <p>
        AlmightyService utilise l&apos;API WhatsApp Business de Meta pour envoyer des notifications
        d&apos;événements. Les messages sont envoyés uniquement aux personnes ayant été invitées
        à un événement organisé via notre plateforme. Vous pouvez demander à ne plus recevoir
        de messages en contactant l&apos;organisateur de l&apos;événement.
      </p>

      <h2 style={{ fontSize: '1.3rem', marginTop: '32px', marginBottom: '12px' }}>
        5. Conservation des données
      </h2>
      <p>
        Les données sont conservées pendant la durée de l&apos;événement et jusqu&apos;à
        6 mois après sa clôture, puis supprimées automatiquement.
      </p>

      <h2 style={{ fontSize: '1.3rem', marginTop: '32px', marginBottom: '12px' }}>
        6. Vos droits
      </h2>
      <p>
        Vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression de vos
        données. Pour exercer ces droits, contactez-nous à :
        <strong> contact@almightyservice.app</strong>
      </p>

      <h2 style={{ fontSize: '1.3rem', marginTop: '32px', marginBottom: '12px' }}>
        7. Contact
      </h2>
      <p>
        AlmightyService<br />
        Kinshasa, République Démocratique du Congo<br />
        Email : contact@almightyservice.app<br />
        WhatsApp : +243 985 371 961
      </p>
    </div>
  )
}