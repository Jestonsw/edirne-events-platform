import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { pendingEvents, pendingEventCategories } from '@/lib/schema'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('🎉 Submit Event API - received body:', body)
    
    // Validate required fields
    if (!body.title || !body.startDate || !body.location || !body.submitterName || !body.submitterEmail) {
      console.log('🎉 Submit Event API - missing required fields')
      return NextResponse.json({ error: 'Zorunlu alanları doldurun' }, { status: 400 })
    }
    
    // Validate categories (1-3 required)
    if (!body.categoryIds || !Array.isArray(body.categoryIds) || body.categoryIds.length < 1 || body.categoryIds.length > 3) {
      console.log('🎉 Submit Event API - invalid categories:', body.categoryIds)
      return NextResponse.json({ error: 'En az 1, en fazla 3 kategori seçmelisiniz' }, { status: 400 })
    }
    
    console.log('🎉 Submit Event API - creating event with submitter:', {
      submitterName: body.submitterName,
      submitterEmail: body.submitterEmail,
      submitterPhone: body.submitterPhone
    })
    
    const newEvent = await db.insert(pendingEvents).values({
      title: body.title,
      description: body.description,
      startDate: new Date(body.startDate),
      endDate: body.endDate ? new Date(body.endDate) : null,
      startTime: body.startTime && body.startTime.trim() !== '' ? body.startTime : null,
      endTime: body.endTime && body.endTime.trim() !== '' ? body.endTime : null,
      location: body.location,
      address: body.address,
      latitude: body.latitude ? parseFloat(body.latitude) : null,
      longitude: body.longitude ? parseFloat(body.longitude) : null,
      organizerName: body.organizerName,
      organizerContact: body.organizerContact,
      categoryId: body.categoryIds[0], // Keep first category for backward compatibility
      price: body.price,
      capacity: body.capacity ? parseInt(body.capacity) : null,
      imageUrl: body.imageUrl,
      imageUrl2: body.imageUrl2,
      imageUrl3: body.imageUrl3,
      mediaFiles: JSON.stringify(body.mediaFiles || []), // Store unlimited media as JSON
      websiteUrl: body.websiteUrl,
      ticketUrl: body.ticketUrl,
      tags: body.tags ? JSON.stringify(body.tags) : null,
      participantType: body.participantType,
      submitterName: body.submitterName,
      submitterEmail: body.submitterEmail,
      submitterPhone: body.submitterPhone,
      status: 'pending',
    }).returning()

    // Insert category relationships
    const categoryPromises = body.categoryIds.map((categoryId: number) =>
      db.insert(pendingEventCategories).values({
        pendingEventId: newEvent[0].id,
        categoryId: categoryId
      })
    )
    
    await Promise.all(categoryPromises)

    console.log('🎉 Submit Event API - created pending event:', newEvent[0])
    return NextResponse.json({ 
      message: 'Etkinlik öneriniz başarıyla gönderildi! Admin onayından sonra yayınlanacaktır.',
      event: newEvent[0] 
    }, { status: 201 })
  } catch (error) {
    console.error('🎉 Submit Event API - error:', error)
    return NextResponse.json({ error: 'Etkinlik gönderiminde hata oluştu' }, { status: 500 })
  }
}