'use client'
import styled from '@emotion/styled'
import Link from 'next/link'

const PageWrapper = styled.div`
  background: white;
  color: #111827;
  padding: 4rem 2rem;

  @media (min-width: 768px) {
    padding: 6rem 2rem;
  }
`;

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #10B981 0%, #8B5CF6 50%, #EC4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  @media (min-width: 768px) {
    font-size: 3.5rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.25rem;
  color: #6B7280;
  margin-bottom: 4rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const ContentBox = styled.div`
  background: #F9FAFB;
  border-radius: 16px;
  padding: 2.5rem;
  text-align: left;
  margin-bottom: 3rem;
  border: 1px solid #E5E7EB;

  h2 {
    font-size: 1.75rem;
    font-weight: 700;
    margin-bottom: 2rem;
    text-align: center;
  }
`;

const PrinciplesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const Principle = styled.li`
  margin-bottom: 2rem;
  padding-left: 2.5rem;
  position: relative;

  &:before {
    content: '🌿';
    position: absolute;
    left: 0;
    top: 0;
    font-size: 1.5rem;
    color: #10B981;
  }

  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
  }

  p {
    color: #4B5563;
    line-height: 1.7;
    margin: 0;
  }
`;

const Signature = styled.div`
  margin-top: 3rem;
  font-style: italic;
  color: #4B5563;

  p {
    margin-bottom: 1rem;
  }
`;

const BackButton = styled(Link)`
  display: inline-block;
  margin-top: 3rem;
  background: #8B5CF6;
  color: white;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  border-radius: 50px;
  text-decoration: none;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(139, 92, 246, 0.3);
  }
`;

export const Charter = () => {
  return (
    <PageWrapper>
      <Container>
        <Title>Notre Cocon : La Charte de Bienveillance</Title>
        <Subtitle>
          Pour que cet espace reste un sanctuaire de confiance et de transformation, 
          voici les valeurs qui nous unissent et nous protègent.
        </Subtitle>

        <ContentBox>
          <h2>Nos Engagements Mutuels</h2>
          <PrinciplesList>
            <Principle>
              <h3>La Confidentialité : Notre Sanctuaire</h3>
              <p>Ce qui se dit dans le cocon reste dans le cocon. Le partage de la vulnérabilité exige une confiance absolue. Toute forme de capture d'écran ou de partage d'informations en dehors de ce groupe est strictement interdite et entraînera une exclusion immédiate.</p>
            </Principle>
            <Principle>
              <h3>Le Non-Jugement : Votre Histoire est la Vôtre</h3>
              <p>Chacun arrive ici avec son propre chemin, ses propres épreuves et ses propres victoires. Nous nous engageons à écouter chaque histoire avec une empathie radicale, sans jamais juger, critiquer ou comparer les parcours.</p>
            </Principle>
            <Principle>
              <h3>L'Écoute et le Partage Constructif</h3>
              <p>Nous sommes ici pour partager nos expériences ("Je ressens...", "J'ai vécu...") et non pour donner des leçons ("Tu devrais..."). Les conseils non sollicités sont proscrits. Nous privilégions les questions ouvertes et le soutien qui renforce l'autonomie de chacun.</p>
            </Principle>
            <Principle>
              <h3>Le Respect Absolu</h3>
              <p>Toute forme de discours haineux, de discrimination, de harcèlement ou de manque de respect est intolérable. Nous célébrons nos différences et nous nous engageons à communiquer avec la plus grande courtoisie, même en cas de désaccord.</p>
            </Principle>
            <Principle>
              <h3>La Sécurité Avant Tout : Zéro Tolérance</h3>
              <p>Toute forme de démarchage commercial, de promotion, de spam ou d'invitation en message privé est formellement interdite. Ce groupe n'est pas un lieu de prospection. Les administrateurs veillent au grain et appliqueront cette règle avec la plus grande fermeté.</p>
            </Principle>
          </PrinciplesList>
        </ContentBox>

        <Signature>
          <p>"Je m'engage personnellement, avec Anthony, à faire respecter ce cadre pour protéger chaque membre de cette communauté."</p>
          <strong>- Sigrid 🌿</strong>
        </Signature>

        <BackButton href="/programme">
          ← Revenir au programme
        </BackButton>
      </Container>
    </PageWrapper>
  );
};
