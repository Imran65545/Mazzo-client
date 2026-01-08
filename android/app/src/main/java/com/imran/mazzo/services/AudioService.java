package com.imran.mazzo.services;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Binder;
import android.os.Build;
import android.os.IBinder;
import android.support.v4.media.MediaMetadataCompat;
import android.support.v4.media.session.MediaSessionCompat;
import android.support.v4.media.session.PlaybackStateCompat;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;
import androidx.media.app.NotificationCompat.MediaStyle;

import com.google.android.exoplayer2.ExoPlayer;
import com.google.android.exoplayer2.MediaItem;
import com.google.android.exoplayer2.Player;
import com.imran.mazzo.MainActivity;
import com.imran.mazzo.R;

public class AudioService extends Service {

    public static final String ACTION_PLAY = "com.imran.mazzo.ACTION_PLAY";
    public static final String ACTION_PAUSE = "com.imran.mazzo.ACTION_PAUSE";
    public static final String ACTION_RESUME = "com.imran.mazzo.ACTION_RESUME";
    public static final String ACTION_STOP = "com.imran.mazzo.ACTION_STOP";

    private ExoPlayer player;
    private MediaSessionCompat mediaSession;
    private static final String CHANNEL_ID = "MusicPlaybackChannel";
    private static final int NOTIFICATION_ID = 1;

    @Override
    public void onCreate() {
        super.onCreate();
        player = new ExoPlayer.Builder(this).build();
        
        mediaSession = new MediaSessionCompat(this, "AudioService");
        mediaSession.setCallback(new MediaSessionCompat.Callback() {
            @Override
            public void onPlay() {
                if (player != null) player.play();
                updateNotification();
            }

            @Override
            public void onPause() {
                if (player != null) player.pause();
                updateNotification();
            }

            @Override
            public void onStop() {
                stopSelf();
            }
        });
        mediaSession.setActive(true);

        player.addListener(new Player.Listener() {
            @Override
            public void onPlaybackStateChanged(int playbackState) {
                updateNotification();
                if (playbackState == Player.STATE_ENDED) {
                    // Handle completion
                }
            }

            @Override
            public void onIsPlayingChanged(boolean isPlaying) {
                updateNotification();
            }
        });
        
        createNotificationChannel();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Music Playback",
                    NotificationManager.IMPORTANCE_LOW
            );
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent == null) return START_NOT_STICKY;

        String action = intent.getAction();
        if (action != null) {
            switch (action) {
                case ACTION_PLAY:
                    String url = intent.getStringExtra("url");
                    String title = intent.getStringExtra("title");
                    String artist = intent.getStringExtra("artist");
                    playAudio(url, title, artist);
                    break;
                case ACTION_PAUSE:
                    if (player != null) player.pause();
                    break;
                case ACTION_RESUME:
                    if (player != null) player.play();
                    break;
                case ACTION_STOP:
                    stopSelf();
                    break;
            }
        }
        return START_NOT_STICKY;
    }

    private void playAudio(String url, String title, String artist) {
        if (url == null) return;
        
        MediaItem mediaItem = MediaItem.fromUri(Uri.parse(url));
        player.setMediaItem(mediaItem);
        player.prepare();
        player.play();

        // Update Metadata
        mediaSession.setMetadata(new MediaMetadataCompat.Builder()
                .putString(MediaMetadataCompat.METADATA_KEY_TITLE, title)
                .putString(MediaMetadataCompat.METADATA_KEY_ARTIST, artist)
                .build());

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(NOTIFICATION_ID, buildNotification(title, artist, true), 
                android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
        } else {
            startForeground(NOTIFICATION_ID, buildNotification(title, artist, true));
        }
    }

    private void updateNotification() {
        if (player == null) return;
        
        MediaMetadataCompat metadata = mediaSession.getController().getMetadata();
        String title = metadata != null ? metadata.getString(MediaMetadataCompat.METADATA_KEY_TITLE) : "Mazzo";
        String artist = metadata != null ? metadata.getString(MediaMetadataCompat.METADATA_KEY_ARTIST) : "Playing";

        Notification notification = buildNotification(title, artist, player.isPlaying());
        NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (manager != null) {
            manager.notify(NOTIFICATION_ID, notification);
        }
    }

    private Notification buildNotification(String title, String artist, boolean isPlaying) {
        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle(title)
                .setContentText(artist)
                .setSmallIcon(R.mipmap.ic_launcher) // Ensure this resource exists
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setOngoing(isPlaying)
                .setContentIntent(createContentIntent());

        // Add Play/Pause Action
        if (isPlaying) {
             builder.addAction(android.R.drawable.ic_media_pause, "Pause", 
                     androidx.media.session.MediaButtonReceiver.buildMediaButtonPendingIntent(this, PlaybackStateCompat.ACTION_PAUSE));
        } else {
             builder.addAction(android.R.drawable.ic_media_play, "Play", 
                     androidx.media.session.MediaButtonReceiver.buildMediaButtonPendingIntent(this, PlaybackStateCompat.ACTION_PLAY));
        }

        builder.setStyle(new MediaStyle()
                .setMediaSession(mediaSession.getSessionToken())
                .setShowActionsInCompactView(0));

        return builder.build();
    }

    private PendingIntent createContentIntent() {
        Intent intent = new Intent(this, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
        return PendingIntent.getActivity(this, 0, intent, PendingIntent.FLAG_IMMUTABLE);
    }

    @Override
    public void onDestroy() {
        if (player != null) {
            player.release();
            player = null;
        }
        if (mediaSession != null) {
            mediaSession.release();
            mediaSession = null;
        }
        super.onDestroy();
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null; // Not a bound service
    }
}
