package com.imran.mazzo;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.imran.mazzo.plugins.NativeAudioPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(NativeAudioPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
