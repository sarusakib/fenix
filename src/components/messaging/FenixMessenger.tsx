    let optimizedMeta: Awaited<ReturnType<typeof optimizeImageFile>> | null = null

    try {
      if (file.type.startsWith('image/')) {
        optimizedMeta = await optimizeImageFile(file, { maxDimension: 1600 })
        uploadFile = optimizedMeta.file
        messageType = 'image'
      } else if (file.type === 'video/mp4' || file.type === 'video/webm') {
        if (file.size > MAX_FILE_BYTES) throw new Error('Video must be 10MB or smaller.')
        messageType = 'video'
      } else if (file.type === 'application/pdf') {
        if (file.size > MAX_FILE_BYTES) throw new Error('PDF must be 10MB or smaller.')
        messageType = 'file'
      } else if (
        file.type === 'audio/webm' ||
        file.type === 'audio/ogg' ||
        file.type === 'audio/mpeg' ||
        file.type.startsWith('audio/webm;') ||
        file.type.startsWith('audio/ogg;')
      ) {
        if (file.size > MAX_FILE_BYTES) throw new Error('Audio must be 10MB or smaller.')
        messageType = 'audio'
      } else {
        throw new Error('Supported chat files are photos, audio, MP4/WebM video, and PDF.')
      }

      const uploadContentType = uploadFile.type.split(';')[0].trim().toLowerCase()
      const extension = uploadFile.name.split('.').pop()?.toLowerCase() || 'bin'
      const path = userId + '/' + crypto.randomUUID() + '.' + extension
      const { error: uploadError } = await supabase.storage.from('chat-media').upload(path, uploadFile, {
        cacheControl: '3600',
        contentType: uploadContentType,
        upsert: false,
      })
      if (uploadError) throw uploadError

      const { data, error: messageError } = await supabase.from('fenix_direct_messages').insert({
        sender_id: userId,
        recipient_id: activeId,
        body: uploadFile.name.slice(0, 180),
        reply_to_id: replyingTo?.id || null,
        attachment_path: path,
        attachment_name: uploadFile.name.slice(0, 180),
        attachment_type: uploadContentType,
        attachment_size: uploadFile.size,
        message_type: messageType,
        metadata: optimizedMeta ? {
          source_byte_size: optimizedMeta.sourceByteSize ?? file.size,
          source_digest: optimizedMeta.sourceDigest ?? null,
          optimization_version: 'fenix-image-v2',
        } : {},
      }).select(fields).single()

      if (messageError) {
        await supabase.storage.from('chat-media').remove([path])
        throw messageError
      }

      const next = data as unknown as Message
      setMessages(value => value.some(row => row.id === next.id) ? value : [next, ...value])
      await hydrateUrls([next])
      setReplyingTo(null)
      setShowAttach(false)
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Attachment could not be sent.')
    } finally {