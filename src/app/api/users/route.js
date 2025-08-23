import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request) {
  try {
    const body = await request.json()
    const { user_id, email, username, avatar_url, metadata } = body

    // Validate required fields
    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('user')
      .select('*')
      .eq('user_id', user_id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing user:', checkError)
      return NextResponse.json(
        { error: 'Database error checking existing user' },
        { status: 500 }
      )
    }

    let user
    if (existingUser) {
      // Update existing user
      const { data: updatedUser, error: updateError } = await supabase
        .from('user')
        .update({
          email: email || existingUser.email,
          username: username || existingUser.username,
          avatar_url: avatar_url || existingUser.avatar_url,
          metadata: metadata || existingUser.metadata,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user_id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating user:', updateError)
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 }
        )
      }
      user = updatedUser
    } else {
      // Create new user
      const { data: newUser, error: insertError } = await supabase
        .from('user')
        .insert({
          user_id,
          email,
          username,
          avatar_url,
          metadata: metadata || {}
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error creating user:', insertError)
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 }
        )
      }
      user = newUser
    }

    return NextResponse.json({ user })

  } catch (error) {
    console.error('Error in user API:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get('user_id')

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id parameter is required' },
        { status: 400 }
      )
    }

    const { data: user, error } = await supabase
      .from('user')
      .select('*')
      .eq('user_id', user_id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }
      console.error('Error fetching user:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ user })

  } catch (error) {
    console.error('Error in user GET API:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}