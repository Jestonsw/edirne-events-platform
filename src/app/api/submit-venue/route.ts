import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { pendingVenues } from '@/lib/schema'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🏢 Submit Venue API - received body:', body)

    // Validate required fields
    if (!body.name || !body.address || !body.submitterName || !body.submitterEmail) {
      console.log('🏢 Submit Venue API - missing required fields')
      return NextResponse.json({ error: 'Zorunlu alanları doldurun' }, { status: 400 })
    }

    // Insert into pending venues table
    const venueData = {
      name: body.name,
      description: body.description || null,
      categoryId: body.categoryId || null,
      address: body.address,
      phone: body.phone || null,
      phone2: body.phone2 || null,
      email: body.email || null,
      website: body.website || null,
      capacity: body.capacity ? parseInt(body.capacity) : null,
      amenities: body.amenities || null,
      imageUrl: body.imageUrl || null,
      imageUrl_2: body.imageUrl_2 || null,
      imageUrl_3: body.imageUrl_3 || null,
      latitude: body.latitude ? parseFloat(body.latitude) : null,
      longitude: body.longitude ? parseFloat(body.longitude) : null,
      openingHours: body.openingHours || null,
      priceRange: body.priceRange || null,
      submitterName: body.submitterName,
      submitterEmail: body.submitterEmail,
      submitterPhone: body.submitterPhone || null,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    console.log('🏢 Submit Venue API - inserting data:', venueData)

    const result = await db.insert(pendingVenues).values(venueData).returning()
    
    console.log('🏢 Submit Venue API - insert result:', result)

    return NextResponse.json({ 
      success: true, 
      message: 'Mekan öneriniz başarıyla gönderildi! Admin onayından sonra yayınlanacaktır.',
      id: result[0]?.id 
    })

  } catch (error) {
    console.error('🏢 Submit Venue API - error:', error)
    return NextResponse.json({ error: 'Veritabanı hatası' }, { status: 500 })
  }
}