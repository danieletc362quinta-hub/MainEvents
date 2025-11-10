import { useState, useCallback } from 'react';

/**
 * Hook para compartir contenido en redes sociales
 */
export const useSocialShare = () => {
  const [isSharing, setIsSharing] = useState(false);
  const [shareResult, setShareResult] = useState(null);

  /**
   * Compartir en una plataforma específica
   */
  const shareToPlatform = useCallback(async (platform, content) => {
    setIsSharing(true);
    setShareResult(null);

    try {
      const { url, text, hashtags } = content;
      const shareText = text || '';
      const shareUrl = url || window.location.href;
      const shareHashtags = hashtags || '';

      let shareUrl_ = '';

      switch (platform) {
        case 'facebook':
          shareUrl_ = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
          break;
        
        case 'twitter':
          shareUrl_ = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}&hashtags=${encodeURIComponent(shareHashtags)}`;
          break;
        
        case 'whatsapp':
          shareUrl_ = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
          break;
        
        case 'linkedin':
          shareUrl_ = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`;
          break;
        
        case 'telegram':
          shareUrl_ = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
          break;
        
        case 'email':
          shareUrl_ = `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`;
          break;
        
        case 'copy':
          await navigator.clipboard.writeText(shareUrl);
          setShareResult({
            success: true,
            message: 'Enlace copiado al portapapeles',
            platform: 'copy'
          });
          return;
        
        default:
          throw new Error(`Plataforma no soportada: ${platform}`);
      }

      // Abrir ventana de compartir
      const shareWindow = window.open(
        shareUrl_,
        'share',
        'width=600,height=400,scrollbars=yes,resizable=yes'
      );

      if (shareWindow) {
        setShareResult({
          success: true,
          message: `Compartiendo en ${platform}...`,
          platform
        });
      } else {
        throw new Error('No se pudo abrir la ventana de compartir');
      }

    } catch (error) {
      console.error('Error sharing:', error);
      setShareResult({
        success: false,
        message: error.message || 'Error al compartir',
        platform
      });
    } finally {
      setIsSharing(false);
    }
  }, []);

  /**
   * Compartir usando Web Share API (si está disponible)
   */
  const shareNative = useCallback(async (content) => {
    if (!navigator.share) {
      throw new Error('Web Share API no está disponible');
    }

    setIsSharing(true);
    setShareResult(null);

    try {
      await navigator.share({
        title: content.title || '',
        text: content.text || '',
        url: content.url || window.location.href
      });

      setShareResult({
        success: true,
        message: 'Contenido compartido exitosamente',
        platform: 'native'
      });

    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error sharing natively:', error);
        setShareResult({
          success: false,
          message: error.message || 'Error al compartir',
          platform: 'native'
        });
      }
    } finally {
      setIsSharing(false);
    }
  }, []);

  /**
   * Verificar si Web Share API está disponible
   */
  const canShareNative = useCallback(() => {
    return navigator.share && navigator.canShare;
  }, []);

  /**
   * Generar URL de compartir para una plataforma
   */
  const generateShareUrl = useCallback((platform, content) => {
    const { url, text, hashtags } = content;
    const shareText = text || '';
    const shareUrl = url || window.location.href;
    const shareHashtags = hashtags || '';

    switch (platform) {
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
      
      case 'twitter':
        return `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}&hashtags=${encodeURIComponent(shareHashtags)}`;
      
      case 'whatsapp':
        return `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
      
      case 'linkedin':
        return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`;
      
      case 'telegram':
        return `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
      
      case 'email':
        return `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`;
      
      default:
        return null;
    }
  }, []);

  /**
   * Obtener plataformas disponibles
   */
  const getAvailablePlatforms = useCallback(() => {
    const platforms = [
      'facebook',
      'twitter',
      'whatsapp',
      'linkedin',
      'telegram',
      'email',
      'copy'
    ];

    if (canShareNative()) {
      platforms.unshift('native');
    }

    return platforms;
  }, [canShareNative]);

  /**
   * Limpiar resultado de compartir
   */
  const clearResult = useCallback(() => {
    setShareResult(null);
  }, []);

  return {
    isSharing,
    shareResult,
    shareToPlatform,
    shareNative,
    canShareNative,
    generateShareUrl,
    getAvailablePlatforms,
    clearResult
  };
};

export default useSocialShare;




